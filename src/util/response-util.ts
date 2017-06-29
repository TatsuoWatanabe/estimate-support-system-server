import * as express    from 'express';
import * as HttpStatus from 'http-status-codes';
import { Consts }      from '../consts/consts';

export class ResponseUtil {

  /**
   * Set status code to response. 400: 'Bad Request'
   */
  public static badRequest(res: express.Response, message = Consts.Msgs.badRequest, errors = {}) {
    return ResponseUtil.failed(res, message, HttpStatus.BAD_REQUEST, errors);
  }

  /**
   * validation failed.
   */
  public static validationFailed(res: express.Response, errors: Object) {
    ResponseUtil.badRequest(res, Consts.Msgs.validationFailed, errors);
  }

  /**
   * Set status code to response. 401: 'Unauthorized'
   */
  public static authFailed(res: express.Response, message = Consts.Msgs.authFailed) {
    return ResponseUtil.deleteToken(res).status(HttpStatus.UNAUTHORIZED).json({
      message
    });
  }

  /**
   * Set status code to response. 403: 'Forbidden'
   */
  public static forbidden(res: express.Response, message = Consts.Msgs.forbidden) {
    return ResponseUtil.failed(res, message, HttpStatus.FORBIDDEN);
  }

  /**
   * Set status code to response. 404: 'Not Found'
   */
  public static notFound(res: express.Response, message = Consts.Msgs.notFound) {
    return ResponseUtil.failed(res, message, HttpStatus.NOT_FOUND);
  }

  /**
   * Set status code to response.
   */
  public static failed(res: express.Response, message: string, resCode: number, errors = {}) {
    return res.status(resCode).json({
      message,
      errors
    });
  }

  /**
   * Respond as success.
   */
  public static success(res: express.Response, message = Consts.Msgs.success, opt?: any) {
    const objMessage = {
      message
    };
    // add optional parameter.
    const payload = opt ? Object.assign(objMessage, opt) : objMessage;
    return res.json(payload);
  }

  /**
   * Set status code to response.
   */
  public static dbError(err: any, status = HttpStatus.BAD_REQUEST) {
    const errObj = (err instanceof String) ? { message: err } : err;
    errObj.status = errObj.status || status;
    console.log(errObj);
    return errObj;
  }

  /**
   * Delete the token from cookie.
   */
  public static deleteToken(res: express.Response) {
    return res.clearCookie(Consts.Cookies.token);
  }

}
