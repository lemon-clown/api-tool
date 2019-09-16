/**
 * 响应码 (response code)
 */
export enum ResponseCode {
  /**
   * 200 OK
   */
  S_OK = 200,

  /**
   * 400 请求数据错误 (BAD REQUEST)
   */
  F_BAD_REQUEST = 400,

  /**
   * 401 认证错误 (UNAUTHORIZED)
   */
  F_UNAUTHORIZED = 401,

  /**
   * 403 权限错误，禁止访问 (FORBIDDEN)
   */
  F_FORBIDDEN = 403,

  /**
   * 500 服务器内部错误 (INTERNAL SERVER ERROR))))
   */
  F_INTERNAL_SERVER_ERROR = 500,
}
