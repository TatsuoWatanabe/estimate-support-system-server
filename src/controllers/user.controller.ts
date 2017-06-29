import * as express         from 'express';
import * as mongoose        from 'mongoose';
import { AuthController }   from './auth.controller';
import { User }             from '../models/user';
import { ProjectPersonnel } from '../models/project-personnel';
import { RequestUtil }      from '../util/request-util';
import { ResponseUtil }     from '../util/response-util';
import { ParameterUtil }    from '../util/parameter-util';
import { Consts, SP }       from '../consts/consts';
const ObjectId = mongoose.Types.ObjectId;

export class UserController {

  public static get routes() {
    const router = express.Router();
    router.get('/'                    , AuthController.needLogin, UserController.getUser);
    router.get('/list'                , AuthController.needLogin, UserController.getUsers);
    router.get('/project-month'       , AuthController.needLogin, UserController.getUsersByProjectMonth);
    router.post('/'                   , AuthController.needLogin, AuthController.needPermission, UserController.saveUser);
    router.post('/validate'           , AuthController.needLogin,                                UserController.validateSave);
    router.put('/change-pass'         , AuthController.needLogin,                                UserController.changePass);
    router.put('/change-pass/validate', AuthController.needLogin,                                UserController.validateChangePass);
    router.delete('/'                 , AuthController.needLogin, AuthController.needPermission, UserController.deleteUser);
    return router;
  }

  /**
   * Get User
   */
  public static getUser(req: express.Request, res: express.Response, next) {
    // find the user
    User.findById(req.query[SP._id], User).then((doc) => {
      const user = doc as User;
      user.password = ''; // delete pasword info.
      res.json({ user });
    }).catch((reason: any) =>
      next(ResponseUtil.dbError(reason))
    );
  }

  /**
   * Get Users 
   */
  public static getUsers(req: express.Request, res: express.Response, next) {
    const limitSkip = ParameterUtil.getLimitSkip(req.query);
    // build query.
    const query = {};
    if (req.query[SP.name]) {
      const $regexName = { $regex: ParameterUtil.escapeRegExp(req.query[SP.name]) };
      query['$or'] = [
        { username    : $regexName },
        { displayName : $regexName },
        { employeeCode: $regexName }
      ];
    }
    // find the projects.
    const counter = User.model.count(query);
    const cursor  = User.model.find(query);
    // set sort.
    cursor.sort('_id');
    // set limit.
    cursor.limit(limitSkip.limit);
    // set skip.
    cursor.skip(limitSkip.skip);
    // get the results.
    Promise.all([counter, cursor]).then((results) => {
      const totalItems = results[0];
      const users = results[1];
      const responseUsers = users.map(user => {
        user.password = ''; // delete password info.
        return user;
      });
      res.json({
        totalItems,
        users: responseUsers
      });
    }).catch((reason: any) =>
      next(ResponseUtil.dbError(reason))
    );
  }

  /**
   * Get users of specified project, month.
   */
  public static getUsersByProjectMonth(req: express.Request, res: express.Response, next) {
    if (!req.query[SP.projectId]) { return ResponseUtil.badRequest(res, Consts.Msgs.requiredThat(SP.projectId)); }
    if (!req.query[SP.yyyymm])    { return ResponseUtil.badRequest(res, Consts.Msgs.requiredThat(SP.yyyymm)); }
    // TODO: validate req.query parameters.

    const projectId = new ObjectId(req.query[SP.projectId]);
    const yyyymm = req.query[SP.yyyymm];
    const query = {
      projectId,
      periodTo  : { $gte: yyyymm },
      periodFrom: { $lte: yyyymm }
    };
    // find the project-personnel
    ProjectPersonnel.model.find(query).then((ppArray) => {
      const userIds = ppArray.map((pp) => pp.userId);
      // find the users
      return User.model.find({ _id: { $in: userIds }}).sort('_id').exec();
    }).then((users) => {
       res.json({ users });
    }).catch((reason: any) => next(ResponseUtil.dbError(reason)));
  }

  public static validateSave(req: express.Request, res: express.Response, next) {
    req.body[SP.validationOnly] = true;
    return UserController.saveUser(req, res, next);
  }

  /**
   * Save User
   */
  public static saveUser(req: express.Request, res: express.Response, next) {
    const params = req.body || {};
    const isNew = !params._id;
    const receivePassword = isNew;
    const validationOnly = params[SP.validationOnly];

    // validation
    const errors = User.validateSaveUser(params, receivePassword);
    if (Object.keys(errors).length !== 0) {
      return ResponseUtil.validationFailed(res, errors);
    } else if (validationOnly) {
      return ResponseUtil.success(res);
    }

    User.saveUser(params, receivePassword).then((raw: any) => {
      res.json({ raw });
    }).catch((reason: any) =>
      next(ResponseUtil.dbError(reason))
    );
  }

  public static validateChangePass(req: express.Request, res: express.Response, next) {
    req.body[SP.validationOnly] = true;
    return UserController.changePass(req, res, next);
  }

  /**
   * Change user's password.
   */
  public static changePass(req: express.Request, res: express.Response, next) {
    const params         = req.body || {};
    const oldPass        = params[SP.oldPass];
    const newPass        = params[SP.newPass];
    const newPassConfirm = params[SP.newPassConfirm];
    const validationOnly = params[SP.validationOnly];
    const loginUser      = RequestUtil.requireUser(req);

    // validation
    const errors = User.validateChangePassword(oldPass, newPass, newPassConfirm);
    if (Object.keys(errors).length !== 0) {
      return ResponseUtil.validationFailed(res, errors);
    } else if (validationOnly) {
      return ResponseUtil.success(res);
    }

    User.changePassword(loginUser._id, oldPass, newPass).then((raw) =>
      res.json({ raw })
    ).catch((reason: any) =>
      ResponseUtil.badRequest(res, reason)
    );
  }

  /**
   * Delete User
   */
  public static deleteUser(req: express.Request, res: express.Response, next) {
    // delete the user
    User.removeById(req.query[SP._id], User).then((deleted: any) => {
      deleted.password = ''; // delete pasword info.
      res.json({ deleted });
    }).catch((reason: any) =>
      next(ResponseUtil.dbError(reason))
    );
  }
}
