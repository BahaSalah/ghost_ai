import "server-only"
import { Liveblocks } from "@liveblocks/node"

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined
}

function createLiveblocksClient() {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY
  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not set")
  }
  return new Liveblocks({ secret })
}

export const liveblocks =
  globalForLiveblocks.liveblocks ?? createLiveblocksClient()

if (process.env.NODE_ENV !== "production") {
  globalForLiveblocks.liveblocks = liveblocks
}

const CURSOR_COLORS = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33F1",
  "#33FFF5",
  "#F5FF33",
  "#FF8333",
  "#8333FF",
  "#33FF83",
  "#FF3383",
  "#83FF33",
  "#3383FF",
  "#FF33A8",
  "#33FFA8",
  "#A833FF",
  "#FFA833",
]

export function getUserColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length]
}
