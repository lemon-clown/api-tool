/**
 * response data
 */
export interface ResponseData<T> {
  /**
   * response code
   */
  code: number
  /**
   * response message
   */
  message: string
  /**
   * response data
   */
  result: T
}
