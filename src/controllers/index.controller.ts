import * as express    from 'express';

export class IndexController {

  public static get routes() {
    const router = express.Router();
    router.get('/', IndexController.index);
    return router;
  }

  /**
   * welcome
   */
  public static index(req: express.Request, res: express.Response, next) {
    const url = req.protocol + '://' + req.get('host') + req.originalUrl;
    res.json({
      message: `Welcome! The API is at ${url}`
    });
  }

}
