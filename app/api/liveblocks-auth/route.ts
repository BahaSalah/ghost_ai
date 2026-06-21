import { auth } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"
import { liveblocks, getUserColor } from "@/lib/liveblocks"
import { getProjectForUser } from "@/lib/project-access"

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let roomId: string
  try {
    const body = await request.json()
    if (typeof body.room !== "string" || body.room.trim().length === 0) {
      return Response.json({ error: "Room ID is required" }, { status: 400 })
    }
    roomId = body.room.trim()
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const project = await getProjectForUser(roomId, userId)
  if (!project) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const email = user.emailAddresses[0]?.emailAddress ?? ""
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || email
  const avatar = user.imageUrl
  const color = getUserColor(userId)

  await liveblocks.getOrCreateRoom(roomId, {
    defaultAccesses: [],
  })

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: displayName,
      avatar,
      color,
    },
  })
  session.allow(roomId, ["*:write"])
  const { body, status } = await session.authorize()

  return new Response(body, { status })
}
