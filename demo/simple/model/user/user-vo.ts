import { ResponseData } from '../core/response-data'
import { User } from './user'


/**
 * response of /api/user/:username
 */
export type UserQueryResponseVo = ResponseData<User>


/**
 * request/response of /api/user/me
 */
export type UserUpdateRequestVo = User
export type UserUpdateResponseVo = ResponseData<User>
