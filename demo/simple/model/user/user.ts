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
   * @min 0
   * @max 1000
   * @TJS-type integer
   */
  age: number
}
