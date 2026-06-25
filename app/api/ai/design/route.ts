import { auth as clerkAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { getProjectForUser } from "@/lib/project-access"
import { tasks, auth as triggerAuth } from "@trigger.dev/sdk"
import type { designAgent } from "@/trigger/design-agent"

export async function POST(request: Request) {
  const { userId } = await clerkAuth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let prompt: string | undefined
  let roomId: string | undefined
  let projectId: string | undefined
  try {
    const body = await request.json()
    if (typeof body.prompt === "string" && body.prompt.trim().length > 0) {
      prompt = body.prompt.trim()
    }
    if (typeof body.roomId === "string" && body.roomId.trim().length > 0) {
      roomId = body.roomId.trim()
    }
    if (typeof body.projectId === "string" && body.projectId.trim().length > 0) {
      projectId = body.projectId.trim()
    }
  } catch {}

  if (!prompt || !roomId || !projectId) {
    return Response.json({ error: "Missing required fields: prompt, roomId, projectId" }, { status: 400 })
  }

  const project = await getProjectForUser(projectId, userId)
  if (!project) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const handle = await tasks.trigger<typeof designAgent>("design-agent", { prompt, roomId, userId })

  const publicToken = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        runs: [handle.id],
      },
    },
    expirationTime: "1h",
  })

  const taskRun = await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId,
      userId,
    },
  })

  return Response.json({ runId: taskRun.runId, publicToken }, { status: 201 })
}
