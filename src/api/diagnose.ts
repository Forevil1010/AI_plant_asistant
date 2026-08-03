import { post } from '../utils/request'
import { DiagnoseResult } from '../types'

export const diagnoseDisease = (data: { image: string; plantName?: string }) => {
  return post<DiagnoseResult>('/diagnose/detect', data)
}