import * as crypto from 'crypto';

export class HashUtil {

  /**
   * create the hash string.
   */
  public static hash(str: string) {
    return crypto.createHash('sha512')
                 .update(str)
                 .digest('hex');
  }

  /**
   * compair string with hashed string.
   */
  public static compair(str: any, hashedStr: any) {
    return HashUtil.hash(String(str)) === String(hashedStr);
  }

}
