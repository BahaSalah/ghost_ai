import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { auth as triggerAuth } from "@trigger.dev/sdk"

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let runId: string | undefined
  try {
    const body = await request.json()
    if (typeof body.runId === "string" && body.runId.trim().length > 0) {
      runId = body.runId.trim()
    }
  } catch {}

  if (!runId) {
    return Response.json({ error: "Missing required field: runId" }, { status: 400 })
  }

  const taskRun = await prisma.taskRun.findUnique({
    where: { runId },
  })

  if (!taskRun) {
    return Response.json({ error: "Run not found" }, { status: 404 })
  }

  if (taskRun.userId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const publicToken = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        runs: [runId],
      },
    },
    expirationTime: "1h",
  })

  return Response.json({ token: publicToken })
}
