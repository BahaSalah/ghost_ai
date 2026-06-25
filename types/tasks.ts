export interface AiStatusPayload {
  message: string
  step: "start" | "processing" | "complete" | "error"
  timestamp: number
  text?: string
}

export interface AiChatMessage {
  senderName: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}
