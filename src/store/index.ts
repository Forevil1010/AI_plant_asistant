import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { User, GardenPlant } from '../types'
import storage from '../utils/storage'

interface AppState {
  user: User | null
  token: string | null
  gardenPlants: GardenPlant[]
}

type Action =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_TOKEN'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_GARDEN_PLANTS'; payload: GardenPlant[] }
  | { type: 'ADD_GARDEN_PLANT'; payload: GardenPlant }
  | { type: 'UPDATE_GARDEN_PLANT'; payload: GardenPlant }
  | { type: 'REMOVE_GARDEN_PLANT'; payload: string }

const initialState: AppState = {
  user: storage.get<User>('user'),
  token: storage.get<string>('token'),
  gardenPlants: storage.get<GardenPlant[]>('gardenPlants') || []
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      storage.set('user', action.payload)
      return { ...state, user: action.payload }
    case 'SET_TOKEN':
      storage.set('token', action.payload)
      return { ...state, token: action.payload }
    case 'LOGOUT':
      storage.clear()
      return { user: null, token: null, gardenPlants: [] }
    case 'SET_GARDEN_PLANTS':
      storage.set('gardenPlants', action.payload)
      return { ...state, gardenPlants: action.payload }
    case 'ADD_GARDEN_PLANT':
      const newPlants = [...state.gardenPlants, action.payload]
      storage.set('gardenPlants', newPlants)
      return { ...state, gardenPlants: newPlants }
    case 'UPDATE_GARDEN_PLANT':
      const updatedPlants = state.gardenPlants.map(p =>
        p.id === action.payload.id ? action.payload : p
      )
      storage.set('gardenPlants', updatedPlants)
      return { ...state, gardenPlants: updatedPlants }
    case 'REMOVE_GARDEN_PLANT':
      const filteredPlants = state.gardenPlants.filter(p => p.id !== action.payload)
      storage.set('gardenPlants', filteredPlants)
      return { ...state, gardenPlants: filteredPlants }
    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<Action>
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  setGardenPlants: (plants: GardenPlant[]) => void
  addGardenPlant: (plant: GardenPlant) => void
  updateGardenPlant: (plant: GardenPlant) => void
  removeGardenPlant: (id: string) => void
}

const AppContext = createContext<AppContextType | null>(null)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const setUser = useCallback((user: User) => {
    dispatch({ type: 'SET_USER', payload: user })
  }, [])

  const setToken = useCallback((token: string) => {
    dispatch({ type: 'SET_TOKEN', payload: token })
  }, [])

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' })
  }, [])

  const setGardenPlants = useCallback((plants: GardenPlant[]) => {
    dispatch({ type: 'SET_GARDEN_PLANTS', payload: plants })
  }, [])

  const addGardenPlant = useCallback((plant: GardenPlant) => {
    dispatch({ type: 'ADD_GARDEN_PLANT', payload: plant })
  }, [])

  const updateGardenPlant = useCallback((plant: GardenPlant) => {
    dispatch({ type: 'UPDATE_GARDEN_PLANT', payload: plant })
  }, [])

  const removeGardenPlant = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_GARDEN_PLANT', payload: id })
  }, [])

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        setUser,
        setToken,
        logout,
        setGardenPlants,
        addGardenPlant,
        updateGardenPlant,
        removeGardenPlant
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = (): AppContextType => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export default AppContext