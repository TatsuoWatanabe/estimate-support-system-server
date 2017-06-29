import * as express      from 'express';
import * as mongoose     from 'mongoose';
import * as path         from 'path';
import * as bodyParser   from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as morgan       from 'morgan';
import * as HttpStatus   from 'http-status-codes';
import * as basicAuth    from 'basic-auth-connect';
import { Routes }        from './routes/routes';
import { Consts }        from './consts/consts';

export const app = express();

// --- basic auth ---------------------------------
(() => {
  const user = process.env.BASIC_USER;
  const pass = process.env.BASIC_PASS;
  if (user && pass) {
    app.use(basicAuth(user, pass));
  }
})();
// ------------------------------------------------

// --- set library to app -------------------------
(() => {
  // use morgan to log requests to the console
  app.use(morgan('dev'));
  // use body parser so we can get info from POST and/or URL parameters
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  // use cookie parser
  app.use(cookieParser());
  // set public directry
  app.use(express.static(path.join(__dirname, '/../public')));
})();
// ------------------------------------------------
// --- set response header to app -----------------
(() => {
  console.log('process.env.ALLOW_ORIGIN', process.env.ALLOW_ORIGIN);
  app.use((req, res, next) => {
    res.header(Consts.Headers.accessControlAllowOrigin, process.env.ALLOW_ORIGIN);
    res.header(Consts.Headers.accessControlAllowCredentials, 'true');
    res.header(Consts.Headers.accessControlAllowHeaders, 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header(Consts.Headers.accessControlAllowMethods, 'GET, POST, PUT, DELETE, OPTIONS');
    next();
  });
})();
// ------------------------------------------------
// --- set variables to app -----------------------
(() => {
  // secret variable for auth token.
  app.set(Consts.App.superSecret, process.env.SUPER_SECRET);
  // set NODE_ENV variable to app.
  app.set(Consts.App.nodeEnv, process.env.NODE_ENV);
  // set isDev variable to app.
  const isDev = app.get(Consts.App.nodeEnv) === Consts.App.env.development;
  app.set(Consts.App.isDev, isDev);
  app.set(Consts.Headers.xPoweredBy, isDev);
})();
// ------------------------------------------------

// set app routing.
Routes.init(app);

// --- Event listener for 'error' event -----------
(() => {
  const isDev = app.get(Consts.App.isDev);

  const errorHandler = function(err: Error, req: express.Request, res: express.Response, next: any) {
    res.status(err['status'] || HttpStatus.INTERNAL_SERVER_ERROR);

    const resObj: any = {
      message: err.message
    };

    // in development environment, set more informations.
    if (isDev) {
      resObj.error = err;
      resObj.requestHeaders = req.headers;
    }
    res.json(resObj);
  };

  app.use(errorHandler);
})();
// ------------------------------------------------

// --- connect to Database ------------------------
(() => {
  const connectString: string = process.env.MONGODB_URI;
  // mpromise (mongoose's default promise library) is deprecated,
  // plug in your own promise library instead.
  const mong = mongoose;
  mong['Promise'] = global.Promise;
  mongoose.connect(connectString, (err) => {
    if (err) { console.log(err); }
    else     { console.log('connected to database.'); }
  });
})();
// ------------------------------------------------

