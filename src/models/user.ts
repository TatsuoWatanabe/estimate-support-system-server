import * as mongoose   from 'mongoose';
import { BaseModel }   from './base-model';
import { HashUtil }    from '../util/hash-util';
import { Validator }   from '../util/validator';
import { Consts }      from '../consts/consts';
import { PasswordLog } from '../models/password-log';

const _def = {
  objectId: mongoose.Schema.Types.ObjectId,
  username:     { type: String , index: { unique: true }, required: '{PATH} is required!'},
  password:     { type: String },
  displayName:  { type: String , required: '{PATH} is required!'},
  employeeCode: { type: String },
  admin   :     { type: Boolean, default: false },
  created :     { type: Date   , default: Date.now },
  modified:     { type: Date   , default: Date.now }
};
const _schema = new mongoose.Schema(
  _def
).pre('update', function(next) {
  const user = this._update.$set as User;
  if (user.password) {
    user.password = HashUtil.hash(String(user.password));
  }
  user.modified = new Date();
  next();
});

export interface IUser extends mongoose.Document, User { }
const _model = mongoose.model<IUser>('User', _schema);

export class User extends BaseModel {

  public static modelInterface = <IUser>{};
  public static model          = _model;
  public static schema         = _schema;
  public static def            = _def;

  public objectId:     typeof _def.objectId;
  public username:     typeof _def.username.type.prototype;
  public password:     typeof _def.password.type.prototype;
  public displayName:  typeof _def.displayName.type.prototype;
  public employeeCode: typeof _def.employeeCode.type.prototype;
  public admin:        typeof _def.admin.type.prototype;
  public created:      typeof _def.created.type.prototype;
  public modified:     typeof _def.modified.type.prototype;

 /**
  * Factory method
  */
  public static createDocument(doc: Object = {}) {
    return new User.model(doc);
  }

  public static saveUser(params: { _id?: Object | string | number}, receivePassword = true) {
    // validate the params.
    const prms = User.validate(params, User).then((doc: any) => {
      const user = doc as IUser;
      const updateDoc: any = user.toJSON();
      if (!receivePassword) {
        delete updateDoc['password'];
      }
      return Promise.resolve({user, updateDoc});
    })
    // write log.
    .then((obj) => {
      if (!receivePassword) {
        // do nothing.
        return Promise.resolve(obj);
      }
      // save log.
      const pLog = PasswordLog.createDocument({
        userId     : obj.user._id,
        username   : obj.user.username,
        password   : obj.user.password,
        displayName: obj.user.displayName,
      });
      return PasswordLog.save(pLog, PasswordLog).then((res) =>
         Promise.resolve(obj)
      );
    })
    // save user.
    .then((obj) => {
      const user = obj.user as IUser;
      return user.update(obj.updateDoc, { upsert: true }).then((res) =>
         Promise.resolve(res)
      );
    });
    return prms;
  }

  public static validateChangePassword(oldPass: string, newPass: string, newPassConfirm: string) {
   const errors: {oldPass?; newPass?; newPassConfirm?} = {};
    /* validate oldPass */ {
      const vl  = Validator.getInstance();
      const val = oldPass;
      vl.push(Validator.required  , val, Consts.MsgCodes.Required.password);
      vl.push(Validator.maxLength , val, Consts.Limits.password.max);
      vl.push(Validator.minLength , val, Consts.Limits.password.min);
      vl.push(Validator.singleByte, val);
      if (vl.hasError) { errors.oldPass = vl.getErrors(); }
    }
    /* validate newPass */ {
      const vl  = Validator.getInstance();
      const val = newPass;
      vl.push(Validator.required  , val, Consts.MsgCodes.Required.newPassword);
      vl.push(Validator.maxLength , val, Consts.Limits.password.max);
      vl.push(Validator.minLength , val, Consts.Limits.password.min);
      vl.push(Validator.singleByte, val);
      if (vl.hasError) { errors.newPass = vl.getErrors(); }
    }
    /* validate newPassConfirm */ {
      const vl  = Validator.getInstance();
      const val = newPassConfirm;
      vl.push(() => newPass === val ? '' : Consts.MsgCodes.unmatchPassword);
      vl.push(Validator.required  , val, Consts.MsgCodes.Required.newPassConfirm);
      vl.push(Validator.singleByte, val);
      if (vl.hasError) { errors.newPassConfirm = vl.getErrors(); }
    }
    return errors;
  }

  public static validateSaveUser(params: User, receivePassword: boolean) {
   const errors: {username?; password?; displayName?; employeeCode?} = {};
    /* validate username */ {
      const vl  = Validator.getInstance();
      const val = params.username;
      vl.push(Validator.required    , val, Consts.MsgCodes.Required.username);
      vl.push(Validator.maxLength   , val, Consts.Limits.username.max);
      vl.push(Validator.minLength   , val, Consts.Limits.username.min);
      vl.push(Validator.alphanumeric, val);
      if (vl.hasError) { errors.username = vl.getErrors(); }
    }
    /* validate password */ if (receivePassword) {
      const vl  = Validator.getInstance();
      const val = params.password;
      vl.push(Validator.required  , val, Consts.MsgCodes.Required.password);
      vl.push(Validator.maxLength , val, Consts.Limits.password.max);
      vl.push(Validator.minLength , val, Consts.Limits.password.min);
      vl.push(Validator.singleByte, val);
      if (vl.hasError) { errors.password = vl.getErrors(); }
    }
    /* validate displayName */ {
      const vl  = Validator.getInstance();
      const val = params.displayName;
      vl.push(Validator.required , val, Consts.MsgCodes.Required.displayName);
      vl.push(Validator.maxLength, val, Consts.Limits.displayName.max);
      vl.push(Validator.minLength, val, Consts.Limits.displayName.min);
      if (vl.hasError) { errors.displayName = vl.getErrors(); }
    }
    /* validate employeeCode */ {
      const vl  = Validator.getInstance();
      const val = params.employeeCode;
      vl.push(Validator.maxLength, val, Consts.Limits.employeeCode.max);
      vl.push(Validator.minLength, val, Consts.Limits.employeeCode.min);
      if (vl.hasError) { errors.employeeCode = vl.getErrors(); }
    }
    return errors;
  }

  public static changePassword(userId: any, oldPass: string, newPass: string) {
    // find the user.
    return User.findById(userId, User).then((doc) => {
      const user = doc as User;
      return user;
    })
    // validate old password.
    .then((doc) => {
      const user = doc as User;
      const isValidOldPass = HashUtil.compair(oldPass, user.password);
      if (!isValidOldPass) {
        return Promise.reject(Consts.Msgs.wrongPassword);
      }
      return Promise.resolve(user);
    })
    // save the new password.
    .then((doc) => {
      const user = doc as User;
      user.password = newPass;
      return User.saveUser(doc, true);
    });
  }

}
