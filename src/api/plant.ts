import { get, post } from '../utils/request'
import { Plant, IdentifyResult, Pagination } from '../types'

export const identifyPlant = (data: { image: string; imageType: string }) => {
  return post<IdentifyResult>('/plant/identify', data)
}

export const searchPlant = (params: { keyword: string; page?: number; pageSize?: number }) => {
  return get<Pagination<Plant>>('/plant/search', params)
}

export const getPlantDetail = (id: string) => {
  return get<Plant>(`/plant/${id}`)
}

export const getHotPlants = (params?: { limit?: number }) => {
  return get<Plant[]>('/plant/hot', params)
}