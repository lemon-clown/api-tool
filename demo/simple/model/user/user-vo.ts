import { ResponseData } from '../core/response-data'
import { User } from './user'


/**
 * request data of /api/user/:username
 */
export interface GetUserRequestVo {
  username: string
}


/**
 * response of /api/user/:username
 */
export type GetUserResponseVo = ResponseData<User>
