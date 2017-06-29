import * as express         from 'express';
import * as mongoose        from 'mongoose';
import { AuthController }   from './auth.controller';
import { Project }          from '../models/project';
import { ProjectPersonnel } from '../models/project-personnel';
import { ResponseUtil }     from '../util/response-util';
import { Consts, SP }       from '../consts/consts';
const ObjectId = mongoose.Types.ObjectId;

export class ProjectPersonnelController {

  public static get routes() {
    const router = express.Router();
    router.get('/' , AuthController.needLogin, ProjectPersonnelController.getProjectPersonnel);
    router.post('/', AuthController.needLogin, AuthController.needPermission, ProjectPersonnelController.saveProjectPersonnel);
    return router;
  }

  public static getProjectPersonnel(req: express.Request, res: express.Response, next) {
    if (!req.query[SP.projectId]) { return ResponseUtil.badRequest(res, Consts.Msgs.requiredThat(SP.projectId)); }
    // TODO: validate req.query parameters.

    const projectId = new ObjectId(req.query[SP.projectId]);
    const query = { projectId };
    // find the project.
    const projectFind = Project.findById(projectId, Project);
    // find the project personnel.
    const projectPersonnelFind = ProjectPersonnel.model.find(query)
      .sort('_id')
      .populate('userId', '_id admin username displayName')
      .exec();

    Promise.all([projectFind, projectPersonnelFind]).then((results) => {
      const project = results[0];
      const ppArray = results[1];
      // returns existing user only.
      const projectPersonnels = ppArray.filter((pp) => !!pp.userId);
      res.json({
        project,
        projectPersonnels
      });
    }).catch((reason: any) =>
      next(ResponseUtil.dbError(reason))
    );
  }

  /**
   * Save ProjectPersonnels
   */
  public static saveProjectPersonnel(req: express.Request, res: express.Response, next) {
    if (!req.body[SP.projectId])                    { return ResponseUtil.badRequest(res, Consts.Msgs.requiredThat(SP.projectId)); }
    if (!Array.isArray(req.body.projectPersonnels)) { return ResponseUtil.badRequest(res, 'projectPersonnels must be array.'); }

    const projectPersonnels: any[] = req.body.projectPersonnels;
    const projectId = req.body.projectId;
    const insertDocs = projectPersonnels.map((doc: any) => {
      delete doc['_id'];
      doc.projectId = projectId;
      return ProjectPersonnel.createDocument(doc);
    });

    //
    // TODO: validate documents.
    //

    // delete insert
    const promiss = ProjectPersonnel.model.remove({ projectId }).catch((reason: any) => next(ResponseUtil.dbError(reason)));
    if (insertDocs.length === 0) {
      // only delete.
      promiss.then((result) => res.json({ result }));
    } else {
      // insert all.
      promiss.then(() => {
        return ProjectPersonnel.model.insertMany(insertDocs).then((result) => {
          res.json({ result });
        });
      });
    };
  }

}
