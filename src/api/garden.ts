import { get, post, put, del } from '../utils/request'
import { GardenPlant, CareRecord, Pagination } from '../types'

export const getGardenPlants = (params?: { page?: number; pageSize?: number }) => {
  return get<Pagination<GardenPlant>>('/garden/plants', params)
}

export const addGardenPlant = (data: {
  name: string
  englishName?: string
  imageUrl?: string
  waterInterval?: number
  position?: string
}) => {
  return post<GardenPlant>('/garden/plants', data)
}

export const updateGardenPlant = (id: string, data: {
  name?: string
  waterInterval?: number
  position?: string
}) => {
  return put(`/garden/plants/${id}`, data)
}

export const deleteGardenPlant = (id: string) => {
  return del(`/garden/plants/${id}`)
}

export const waterPlant = (id: string) => {
  return post(`/garden/plants/${id}/water`)
}

export const getCareCalendar = (params?: { date?: string }) => {
  return get<{ date: string; tasks: CareRecord[] }>('/garden/calendar', params)
}