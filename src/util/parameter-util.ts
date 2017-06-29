import { Consts, SP } from '../consts/consts';

export class ParameterUtil {

  /**
   * Get the parameter of mongo limit. 
   */
  public static getLimit(param: any) {
    const limit = param[SP.__limit];
    const intValue = parseInt(limit, 10);
    // do not return not infinite value.
    if (!isFinite(intValue)) {
      return Consts.Nums.limitDefault;
    }
    // do not return too large value.
    if (intValue > Consts.Nums.limitMax) {
      return Consts.Nums.limitMax;
    }
    return intValue;
  }

  /**
   * Get the parameter of mongo skip. 
   */
  public static getSkip(param: any) {
    const skip = param[SP.__skip];
    const intValue = parseInt(skip, 10);
    // do not return not infinite value.
    if (!isFinite(intValue)) {
      return 0;
    }
    return intValue;
  }

  /**
   * Get the parameter of mongo limit and skip. 
   */
  public static getLimitSkip(param: any) {
    const limitSkip = {
      limit: ParameterUtil.getLimit(param),
      skip : ParameterUtil.getSkip(param)
    };
    return limitSkip;
  }

  /**
   * Escaping user input to be treated as a literal string  
   * within a regular expression can be accomplished by simple replacement.
   * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
   */
  public static escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

}
