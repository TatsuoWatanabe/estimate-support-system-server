import * as express from 'express';
import { app }      from '../app';
import { Consts }   from '../consts/consts';
import { User }     from '../models/user';

export class SetupController {

  public static get routes() {
    const router = express.Router();
    router.get('/', SetupController.setup);
    return router;
  }

  /**
   * setup
   */
  public static setup(req, res) {
    const isDev = app.get(Consts.App.isDev) as Boolean;
    if (!isDev) {
      res.json({ success: false , message: 'this function is development only.'});
      return;
    }

    // create a sample user
    const setupUser = {
      username   : 'setup',
      password   : 'password',
      displayName: 'setupUser',
      admin      : true
    };

    // save the sample user
    const receivePassword = true;
    User.saveUser(setupUser, receivePassword).then(function(user) {
      res.json({ user });
    }).catch((err) => res.json({ err }));
  }

}
