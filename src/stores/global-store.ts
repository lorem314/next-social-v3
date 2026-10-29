import { createStore } from "zustand/vanilla"
import { RouterOutputs } from "@/trpc/routers/_app"

import { AiChatFile } from "@/types"

export type GlobalState = {
  authedUser: {
    id: string
    nickname: string
    email: string
  } | null
  accessToken: string | null
  aiChatFiles: File[]
}

export type GlobalActions = {
  afterLogin: (data: RouterOutputs["auth"]["login"]) => void
  setAuthedUser: (
    authedUser: RouterOutputs["auth"]["login"]["authedUser"] | null,
  ) => void
  setAccessToken: (
    accessToken: RouterOutputs["auth"]["login"]["accessToken"] | null,
  ) => void
  addAiChatFiles: (files: File[]) => void
  removeAiChatFile: (name: string) => void
}

export type GlobalStore = GlobalState & GlobalActions

export const defaultInitState: GlobalState = {
  authedUser: null,
  accessToken: null,
  aiChatFiles: [],
}

export const createGlobalStore = (
  initState: GlobalState = defaultInitState,
) => {
  return createStore<GlobalStore>()((set, get) => ({
    ...initState,
    afterLogin: (data: RouterOutputs["auth"]["login"]) => {
      set(() => ({
        authedUser: data.authedUser,
        accessToken: data.accessToken,
      }))
    },
    setAuthedUser: (authedUser: GlobalState["authedUser"]) => {
      set(() => ({ authedUser }))
    },
    setAccessToken: (accessToken: GlobalState["accessToken"]) => {
      set(() => ({ accessToken }))
    },

    addAiChatFiles: (newAiChatFiles) => {
      const prevAiChatFiles = get().aiChatFiles
      set(() => ({ aiChatFiles: [...prevAiChatFiles, ...newAiChatFiles] }))
    },
    removeAiChatFile: (name) => {
      const prevAiChatFiles = get().aiChatFiles
      const nextAiChatFiles = prevAiChatFiles.filter(
        (prevAiChatFile) => prevAiChatFile.name !== name,
      )
      set(() => ({ aiChatFiles: nextAiChatFiles }))
    },
  }))
}
