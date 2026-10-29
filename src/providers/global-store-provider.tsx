"use client"

import { type ReactNode, createContext, useState, useContext } from "react"
import { useStore } from "zustand"

import { type GlobalStore, createGlobalStore } from "@/stores/global-store"
import { defaultInitState } from "@/stores/global-store"

export type GlobalStoreApi = ReturnType<typeof createGlobalStore>

export const GlobalStoreContext = createContext<GlobalStoreApi | undefined>(
  undefined,
)

export interface GlobalStoreProviderProps {
  children: ReactNode
  authedUser: GlobalStore["authedUser"]
  accessToken: GlobalStore["accessToken"]
}

export const GlobalStoreProvider = ({
  children,
  authedUser,
  accessToken,
}: GlobalStoreProviderProps) => {
  const [store] = useState(() =>
    createGlobalStore({ ...defaultInitState, authedUser, accessToken }),
  )

  return (
    <GlobalStoreContext.Provider value={store}>
      {children}
    </GlobalStoreContext.Provider>
  )
}

export const useGlobalStore = <T,>(selector: (store: GlobalStore) => T): T => {
  const globalStoreContext = useContext(GlobalStoreContext)

  if (!globalStoreContext) {
    throw new Error(`useGlobalStore must be used within GlobalStoreProvider`)
  }

  return useStore(globalStoreContext, selector)
}
