import * as mongoose   from 'mongoose';
import * as HttpStatus from 'http-status-codes';
import { Consts }      from '../consts/consts';

export abstract class BaseModel {

  public static def: {};
  public static model: mongoose.Model<mongoose.Document>;

  public static createDocument(params?: {_id?: Object | string | number}) {
    return new BaseModel.model(params);
  }

 /**
  * Factory method for save.
  * if document already exists, fillout unspecified fields(for use of validation method).
  */
  public static createDocumentForSave(params: {_id?: Object | string | number}, self: typeof BaseModel) {
    const newDoc = self.createDocument(params._id ? params : undefined);
    const promise = self.model.findById(newDoc._id).then((project) => {
      const editDoc = project || newDoc;
      // set values to editing object.
      Object.keys(self.def).forEach((key) => {
        if (Consts.Models.saveExcludeKeys.indexOf(key) > -1) { return; }
        editDoc[key] = params[key];
      });
      return Promise.resolve(editDoc);
    });

    return promise;
  }

  public static findById(_id: Object | string | number, self: typeof BaseModel) {
    // find the document.
    return self.model.findById(_id).then((doc) => {
      if (!doc) {
        const err = new Error(Consts.Msgs.notFound);
        err['status'] = HttpStatus.NOT_FOUND;
        return Promise.reject(err);
      }
      return Promise.resolve(doc as any);
    });
  }

  public static validate(params: {_id?: Object | string | number}, self: typeof BaseModel) {
    return self.createDocumentForSave(params, self).then((doc) => {
      return doc.validate().then(() => Promise.resolve(doc));
    });
  }

  public static save(params: {_id: Object | string | number}, self: typeof BaseModel) {
    return self.validate(params, self).then((doc) => {
      return doc.update(doc, { upsert: true }).then((result) =>
         Promise.resolve(result)
      );
    });
  }

  public static removeById(_id: Object | string | number, self: typeof BaseModel) {
    // find and remove the document.
    return self.model.findById(_id).then((doc) => {
      if (!doc) {
        const err = new Error(Consts.Msgs.notFound);
        err['status'] = HttpStatus.NOT_FOUND;
        return Promise.reject(err);
      }
      return doc.remove();
    });
  }

}
