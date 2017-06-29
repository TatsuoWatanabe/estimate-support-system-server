import * as mongoose from 'mongoose';
import { BaseModel } from './base-model';

const _def = {
  objectId  : mongoose.Schema.Types.ObjectId,
  projectId : { type: mongoose.Schema.Types.ObjectId, index: true, required: '{PATH} is required!' },
  userId    : { type: mongoose.Schema.Types.ObjectId, index: true, required: '{PATH} is required!', ref: 'User' },
  // TODO: delete "required" parameter to be convenient.
  periodFrom: { type: String, index: true, required: '{PATH} is required!' },
  // TODO: delete "required" parameter to be convenient.
  periodTo  : { type: String, index: true, required: '{PATH} is required!' },
  created   : { type: Date, default: Date.now },
  modified  : { type: Date, default: Date.now }
};
const _schema = new mongoose.Schema(
  _def
);

interface IProjectPersonnel extends mongoose.Document, ProjectPersonnel { }
const _model = mongoose.model<IProjectPersonnel>('ProjectPersonnel', _schema);

export class ProjectPersonnel extends BaseModel {

  public static modelInterface = <IProjectPersonnel>{};
  public static model          = _model;
  public static schema         = _schema;
  public static def            = _def;

  public objectId:   typeof _def.objectId;
  public projectId:  typeof _def.projectId.type.prototype;
  public userId:     typeof _def.userId.type.prototype;
  public periodFrom: typeof _def.periodFrom.type.prototype;
  public periodTo:   typeof _def.periodTo.type.prototype;
  public created:    typeof _def.created.type.prototype;
  public modified:   typeof _def.modified.type.prototype;

 /**
  * Factory method
  */
  public static createDocument(params: Object = {}) {
    return new ProjectPersonnel.model(params);
  }

}
