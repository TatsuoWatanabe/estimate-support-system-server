import * as mongoose from 'mongoose';
import { BaseModel } from './base-model';
import { Validator } from '../util/validator';
import { Consts }    from '../consts/consts';

const _def = {
  objectId: mongoose.Schema.Types.ObjectId,
  name       : { type: String , index: { unique: true }, required: '{PATH} is required!'},
  projectCode: { type: String },
  note       : { type: String },
  created    : { type: Date, default: Date.now },
  modified   : { type: Date, default: Date.now }
};
const _schema = new mongoose.Schema(
  _def
);

interface IProject extends mongoose.Document, Project { }
const _model = mongoose.model<IProject>('Project', _schema);

export class Project extends BaseModel {

  public static modelInterface = <IProject>{};
  public static model          = _model;
  public static schema         = _schema;
  public static def            = _def;

  public objectId:    typeof _def.objectId;
  public name:        typeof _def.name.type.prototype;
  public projectCode: typeof _def.projectCode.type.prototype;
  public note:        typeof _def.note.type.prototype;
  public created:     typeof _def.created.type.prototype;
  public modified:    typeof _def.modified.type.prototype;

 /**
  * Factory method
  */
  public static createDocument(params: Object = {}) {
    return new Project.model(params);
  }

  public static validateSaveProject(params: Project) {
   const errors: {name?; projectCode?; note?} = {};
    /* validate name */ {
      const vl  = Validator.getInstance();
      const val = params.name;
      vl.push(Validator.required , val, Consts.MsgCodes.Required.projectName);
      vl.push(Validator.maxLength, val, Consts.Limits.projectName.max);
      vl.push(Validator.minLength, val, Consts.Limits.projectName.min);
      if (vl.hasError) { errors.name = vl.getErrors(); }
    }
    /* validate projectCode */ {
      const vl  = Validator.getInstance();
      const val = params.projectCode;
      vl.push(Validator.maxLength, val, Consts.Limits.projectCode.max);
      vl.push(Validator.minLength, val, Consts.Limits.projectCode.min);
      if (vl.hasError) { errors.projectCode = vl.getErrors(); }
    }
    /* validate note */ {
      const vl  = Validator.getInstance();
      const val = params.note;
      vl.push(Validator.maxLength, val, Consts.Limits.projectNote.max);
      if (vl.hasError) { errors.note = vl.getErrors(); }
    }
    return errors;
  }

}
