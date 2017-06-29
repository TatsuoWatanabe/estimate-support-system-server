import * as express         from 'express';
import * as mongoose        from 'mongoose';
import { AuthController}    from './auth.controller';
import { Project }          from '../models/project';
import { ProjectPersonnel } from '../models/project-personnel';
import { ResponseUtil }     from '../util/response-util';
import { ParameterUtil }    from '../util/parameter-util';
import { Consts, SP }       from '../consts/consts';
const ObjectId = mongoose.Types.ObjectId;

export class ProjectController {

  public static get routes() {
    const router = express.Router();
    router.get('/'          , AuthController.needLogin, ProjectController.getProject);
    router.get('/list'      , AuthController.needLogin, ProjectController.getProjects);
    router.get('/user-month', AuthController.needLogin, ProjectController.getProjectsByUserMonth);
    router.post('/'         , AuthController.needLogin, AuthController.needPermission, ProjectController.saveProject);
    router.post('/validate' , AuthController.needLogin,                                ProjectController.validateSave);
    router.delete('/'       , AuthController.needLogin, AuthController.needPermission, ProjectController.deleteProject);
    return router;
  }

  /**
   * Get Project 
   */
  public static getProject(req: express.Request, res: express.Response, next) {
    // find the project
    Project.findById(req.query[SP._id], Project).then((doc) => {
      const project = doc as Project;
      res.json({ project });
    }).catch((reason: any) =>
      next(ResponseUtil.dbError(reason))
    );
  }

  public static validateSave(req: express.Request, res: express.Response, next) {
    req.body[SP.validationOnly] = true;
    return ProjectController.saveProject(req, res, next);
  }

  /**
   * Save Project
   */
  public static saveProject(req: express.Request, res: express.Response, next) {
    const params = req.body || {};
    const validationOnly = params[SP.validationOnly];

    // validation
    const errors = Project.validateSaveProject(params);
    if (Object.keys(errors).length !== 0) {
      return ResponseUtil.validationFailed(res, errors);
    } else if (validationOnly) {
      return ResponseUtil.success(res);
    }

    Project.save(params, Project).then((raw: any) => {
      res.json({ raw });
    }).catch((reason: any) =>
      next(ResponseUtil.dbError(reason))
    );
  }

  /**
   * Get Projects 
   */
  public static getProjects(req: express.Request, res: express.Response, next) {
    const limitSkip = ParameterUtil.getLimitSkip(req.query);
    // build query.
    const query = {};
    if (req.query[SP.name]) {
      const $regexName = { $regex: ParameterUtil.escapeRegExp(req.query[SP.name]) };
      query['$or'] = [
        { name       : $regexName },
        { projectCode: $regexName }
      ];
    }

    // find the projects.
    const counter = Project.model.count(query);
    const cursor  = Project.model.find(query);
    // set sort.
    cursor.sort('_id');
    // set limit.
    cursor.limit(limitSkip.limit);
    // set skip.
    cursor.skip(limitSkip.skip);
    // get the results.
    Promise.all([counter, cursor]).then((results) => {
      const totalItems = results[0];
      const projects = results[1];
      res.json({
        totalItems,
        projects
      });
    }).catch((reason: any) =>
      next(ResponseUtil.dbError(reason))
    );
  }

  /**
   * Get Projects of specified user, month.
   */
  public static getProjectsByUserMonth(req: express.Request, res: express.Response, next) {
   if (!req.query[SP.userId]) { return ResponseUtil.badRequest(res, Consts.Msgs.requiredThat(SP.userId)); }
   if (!req.query[SP.yyyymm]) { return ResponseUtil.badRequest(res, Consts.Msgs.requiredThat(SP.yyyymm)); }
    // TODO: validate req.query parameters.

    const userId = new ObjectId(req.query[SP.userId]);
    const yyyymm = req.query[SP.yyyymm];
    const query = {
      userId,
      periodTo  : { $gte: yyyymm },
      periodFrom: { $lte: yyyymm }
    };
    // find the project-personnel
    ProjectPersonnel.model.find(query).then((ppArray) => {
      const projectIds = ppArray.map((pp) => pp.projectId);
      // find the projects
      return Project.model.find({ _id: { $in: projectIds }}).sort('_id').exec();
    }).then((projects) => {
      res.json({ projects });
    }).catch((reason: any) => next(ResponseUtil.dbError(reason)));
  }

  /**
   * Delete User
   */
  public static deleteProject(req: express.Request, res: express.Response, next) {
    // delete the user
    Project.removeById(req.query[SP._id], Project).then((deleted) => {
      res.json({ deleted });
    }).catch((reason: any) =>
      next(ResponseUtil.dbError(reason))
    );
  }

}
