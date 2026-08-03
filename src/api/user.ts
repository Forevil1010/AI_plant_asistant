import { get, post, put } from '../utils/request'
import { User } from '../types'

export const login = (data: { openId: string; nickname?: string; avatarUrl?: string }) => {
  return post<{ token: string; user: User }>('/user/login', data)
}

export const getUserInfo = () => {
  return get<User>('/user/info')
}

export const updateUserInfo = (data: { nickname?: string; avatarUrl?: string }) => {
  return put('/user/info', data)
}