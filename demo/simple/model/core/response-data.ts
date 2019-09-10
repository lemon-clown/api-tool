/**
 * response data
 */
export interface ResponseData<T> {
  /**
   * response code
   * @TJS-type integer
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
