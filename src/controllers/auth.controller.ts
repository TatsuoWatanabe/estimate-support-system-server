import * as express     from 'express';
import * as jwt         from 'jsonwebtoken';
import * as mongoose    from 'mongoose';
import { app }          from '../app';
import { RequestUtil }  from '../util/request-util';
import { ResponseUtil } from '../util/response-util';
import { HashUtil }     from '../util/hash-util';
import { User, IUser }  from '../models/user';
import { Consts }       from '../consts/consts';

export class AuthController {

  public static get routes() {
    const router = express.Router();
    router.post('/'     , AuthController.login);
    router.get('/check' , AuthController.check);
    router.get('/logout', AuthController.needLogin, AuthController.logout);
    return router;
  }

  /**
   * route middleware to verify a token
   */
  public static needLogin(req, res, next) {
    const isDev = app.get(Consts.App.isDev) as Boolean;

    // check header or url parameters or post parameters for token
    const token = req.body.token || req.query.token || req.headers[Consts.Headers.xAccessToken] || req.cookies[Consts.Cookies.token];
    if (!token) { return ResponseUtil.authFailed(res, Consts.Msgs.authFailedBy(isDev ? Consts.Msgs.noToken : '')); }

    // verifies secret and checks exp
    jwt.verify(token, app.get(Consts.App.superSecret), (err, decoded) => {
      if (err) {
        const msg = isDev ? `${err.name}: ${err.message}` : Consts.Msgs.authFailed;
        const expiredAt = err.expiredAt ? `${msg} - expiredAt:${err.expiredAt} - token expires in ${Consts.App.tokenExpiresIn}` : '';
        console.log(expiredAt);
        return ResponseUtil.authFailed(res, msg);
      }

      const userParams = { objectId: new mongoose.Types.ObjectId(decoded.objectId) };
      // refresh the token.
      AuthController.generateToken(userParams, req, res, (newToken, user) => {
        // set User instance to request. 
        req[Consts.App.req.user] = user;
        next();
      }, false);
    });
  }

  /**
   * route middleware to verify a permission
   */
  public static needPermission(req, res, next) {
    const isDev = app.get(Consts.App.isDev) as Boolean;
    const user = RequestUtil.requireUser(req);

    // check header or url parameters or post parameters for token
    const token = req.body.token || req.query.token || req.headers[Consts.Headers.xAccessToken] || req.cookies[Consts.Cookies.token];
    if (!token) { return ResponseUtil.authFailed(res, Consts.Msgs.authFailedBy(isDev ? Consts.Msgs.noToken : '')); }

    // verifies user's permission
    if (user.admin) {
      next();
    } else {
      return ResponseUtil.forbidden(res);
    }
  }

  private static generateToken(
    userParams: { username?: string; password?: string; objectId?: Object},
    req: express.Request,
    res: express.Response,
    onSuccess: (token: string, user: IUser) => void,
    verifyPassword = true
  ) {
    const query = userParams.username ? { username: userParams.username } :
                  userParams.objectId ? { _id: userParams.objectId } : {};

    // find the user
    User.model.findOne(query, (err, user) => {
      const isDev = app.get(Consts.App.isDev) as Boolean;
      // query error
      if (err) {
        return ResponseUtil.badRequest(res, err.message);
      }
      // User not found
      if (!user) {
        const msg = isDev ? Consts.Msgs.userNotFound : Consts.Msgs.authFailed;
        return ResponseUtil.authFailed(res, msg);
      }
      // Wrong password
      if (verifyPassword && !HashUtil.compair(userParams.password, user.password)) {
        const msg = isDev ? Consts.Msgs.wrongPassword : Consts.Msgs.authFailed;
        return ResponseUtil.authFailed(res, msg);
      }

      // if user is found and password is right
      // create a token
      const superSecret = app.get(Consts.App.superSecret) as string;
      if (!superSecret) {
        const msg = isDev ? Consts.Msgs.needSuperSecret : Consts.Msgs.authFailed;
        return ResponseUtil.authFailed(res, msg);
      }
      const payload = { objectId: user._id };
      const token = jwt.sign(payload, superSecret, {
        expiresIn: Consts.App.tokenExpiresIn
      });

      // set the token to response header.
      res.cookie(Consts.Cookies.token, token, { httpOnly: true, secure: !app.get(Consts.App.isDev) });

      // set the token and user to callback parameter.
      user.password = ''; // delete password
      onSuccess(token, user);
    });
  }

  /**
   * authenticate a user 
   */
  public static login(req: express.Request, res: express.Response) {
    const userConditions = { username: req.body.username, password: req.body.password };

    AuthController.generateToken(userConditions, req, res, (token, user) => {
      res.json({
        user,
        token
      });
    });
  }

  /**
   * check authenticated a user 
   */
  public static check(req: express.Request, res: express.Response) {
    AuthController.needLogin(req, res, () => {
      const user = RequestUtil.requireUser(req);
      res.json({ user });
    });
  }

  /**
   * logout
   */
  public static logout(req: express.Request, res: express.Response) {
    ResponseUtil.deleteToken(res).json({
      message: 'User should be logged out!'
    });
  }

}
