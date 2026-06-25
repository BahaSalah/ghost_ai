import { LiveList, LiveObject } from "@liveblocks/client"

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null
      isThinking: boolean
    }

    Storage: {
      aiStatusFeed: LiveList<LiveObject<{
        message: string
        step: "start" | "processing" | "complete" | "error"
        timestamp: number
        text?: string
      }>>
      aiChatFeed: LiveList<LiveObject<{
        senderName: string
        role: "user" | "assistant"
        content: string
        timestamp: number
      }>>
    }

    UserMeta: {
      id: string
      info: {
        name: string
        avatar: string
        color: string
      }
    }

    RoomEvent: {
      type: "ai-status"
      message: string
      step: "start" | "processing" | "complete" | "error"
      timestamp: number
    }

    ThreadMetadata: {}

    RoomInfo: {}
  }
}

export {}
