import { Consts } from '../consts/consts';

export class Validator {
  private errors = [];

  public static getInstance() {
    return new Validator();
  }

  public static required(val: any, msgCode: string) {
    return val ? '' : msgCode;
  }

  public static maxLength(val: string, max: number) {
    if (typeof val !== 'string') { return ''; }
    if (!val)                    { return ''; }
    return val.length <= max ? '' : [Consts.MsgCodes.maxLength, max];
  }

  public static minLength(val: string, min: number) {
    if (typeof val !== 'string') { return ''; }
    if (!val)                    { return ''; }
    return val.length >= min ? '' : [Consts.MsgCodes.minLength, min];
  }

  public static singleByte(val: string) {
    if (typeof val !== 'string') { return ''; }
    if (!val)                    { return ''; }
    return /^[!-~]+$/.test(val) ? '' : Consts.MsgCodes.singleByte;
  }

  public static alphanumeric(val: string) {
    if (typeof val !== 'string') { return ''; }
    if (!val)                    { return ''; }
    return /^[0-9a-zA-Z]+$/.test(val) ? '' : Consts.MsgCodes.alphanumeric;
  }

  public getErrors() {
    return this.errors;
  }

  public get hasError() {
    return this.errors.length !== 0;
  }

  public push(fn: Function, ...params) {
    const result = fn.apply(undefined, params);
    if (result) {
      this.errors.push(result);
    }
  }

}
