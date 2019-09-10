/**
 * user info
 */
export interface User {
  /**
   * user's account (global unique)
   */
  username: string
  /**
   * user's nickname
   */
  nickname: string
  /**
   * user's age
   * @minimum 0
   * @maximum 1000
   * @TJS-type integer
   */
  age: number
}
