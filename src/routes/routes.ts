import * as express                   from 'express';
import * as HttpStatus                from 'http-status-codes';
import { SetupController }            from '../controllers/setup.controller';
import { IndexController }            from '../controllers/index.controller';
import { AuthController }             from '../controllers/auth.controller';
import { UserController }             from '../controllers/user.controller';
import { ProjectController }          from '../controllers/project.controller';
import { ProjectPersonnelController } from '../controllers/project-personnel.controller';
import { Consts }                     from '../consts/consts';

export class Routes {

  public static init(app: express.Express) {
    app.use('/setup'            , SetupController.routes); // for dev only.
    app.use('/auth'             , AuthController.routes);
    app.use('/user'             , UserController.routes);
    app.use('/project'          , ProjectController.routes);
    app.use('/project-personnel', ProjectPersonnelController.routes);

    // root path. Don't place anything under.
    app.use('/',  AuthController.needLogin, IndexController.routes);

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
      const err = new Error(Consts.Msgs.notFound);
      err['status'] = HttpStatus.NOT_FOUND;
      next(err);
    });

  }
}
