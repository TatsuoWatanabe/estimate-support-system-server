import * as express    from 'express';
import * as HttpStatus from 'http-status-codes';
import { IUser }       from '../models/user';
import { Consts }      from '../consts/consts';

export class RequestUtil {

  /**
   * get the user from request.
   */
  public static requireUser(req: express.Request) {
    const target = req[Consts.App.req.user];
    if (!target) {
      const err = new Error(Consts.Msgs.requiredUserNotFound);
      err['status'] = HttpStatus.BAD_REQUEST;
      throw err;
    }
    const user = target as IUser;
    return user;
  }

}
