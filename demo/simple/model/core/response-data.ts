import { ResponseCode } from './response-code'


/**
 * response data
 */
export interface ResponseData<T = undefined> {
  /**
   * response code
   */
  code: ResponseCode
  /**
   * response message
   */
  message: string
  /**
   * response data
   */
  result: T
}
