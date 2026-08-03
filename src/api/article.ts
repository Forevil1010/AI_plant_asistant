import { get } from '../utils/request'
import { Article, DailyTip, Pagination } from '../types'

export const getDailyTip = () => {
  return get<DailyTip>('/tips/daily')
}

export const getArticleList = (params?: { page?: number; pageSize?: number; category?: string }) => {
  return get<Pagination<Article>>('/article/list', params)
}

export const getArticleDetail = (id: string) => {
  return get<Article>(`/article/${id}`)
}