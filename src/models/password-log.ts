import * as mongoose from 'mongoose';
import { BaseModel } from './base-model';

const _def = {
  objectId: mongoose.Schema.Types.ObjectId,
  userId  : mongoose.Schema.Types.ObjectId,
  username:    { type: String },
  password:    { type: String },
  displayName: { type: String },
  created :    { type: Date, default: Date.now }
};
const _schema = new mongoose.Schema(
  _def
);

export interface IPasswordLog extends mongoose.Document, PasswordLog { }
const _model = mongoose.model<IPasswordLog>('PasswordLog', _schema);

export class PasswordLog extends BaseModel {

  public static modelInterface = <IPasswordLog>{};
  public static model          = _model;
  public static schema         = _schema;
  public static def            = _def;

  public objectId: typeof _def.objectId;
  public username: typeof _def.username.type.prototype;
  public password: typeof _def.password.type.prototype;
  public created:  typeof _def.created.type.prototype;

 /**
  * Factory method
  */
  public static createDocument(doc: Object = {}) {
    return new PasswordLog.model(doc);
  }

}
