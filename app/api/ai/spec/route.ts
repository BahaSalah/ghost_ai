import { auth as clerkAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { getProjectForUser } from "@/lib/project-access"
import { tasks, auth as triggerAuth } from "@trigger.dev/sdk"
import type { generateSpec } from "@/trigger/generate-spec"

export async function POST(request: Request) {
  const { userId } = await clerkAuth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let roomId: string | undefined
  let chatHistory: { role: "user" | "assistant"; content: string }[] = []
  let nodes: any[] = []
  let edges: any[] = []
  try {
    const body = await request.json()
    if (typeof body.roomId === "string" && body.roomId.trim().length > 0) {
      roomId = body.roomId.trim()
    }
    if (Array.isArray(body.chatHistory)) {
      chatHistory = body.chatHistory
    }
    if (Array.isArray(body.nodes)) {
      nodes = body.nodes
    }
    if (Array.isArray(body.edges)) {
      edges = body.edges
    }
  } catch {}

  if (!roomId) {
    return Response.json({ error: "Missing required field: roomId" }, { status: 400 })
  }

  const project = await getProjectForUser(roomId, userId)
  if (!project) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const handle = await tasks.trigger<typeof generateSpec>("generate-spec", {
    projectId: project.id,
    roomId,
    chatHistory,
    nodes,
    edges,
  })

  const publicToken = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        runs: [handle.id],
      },
    },
    expirationTime: "1h",
  })

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId: project.id,
      userId,
    },
  })

  return Response.json({ runId: handle.id, publicToken }, { status: 201 })
}
