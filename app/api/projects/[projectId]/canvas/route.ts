import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { put, get } from "@vercel/blob"

async function getProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true, canvasBlobUrl: true },
  })
  if (!project) return null
  if (project.ownerId === userId) return project

  const { clerkClient } = await import("@clerk/nextjs/server")
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const email = user.emailAddresses[0]?.emailAddress
  if (!email) return null

  const collaborator = await prisma.projectCollaborator.findUnique({
    where: { projectId_email: { projectId, email } },
  })
  return collaborator ? project : null
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params
  const project = await getProjectAccess(projectId, userId)
  if (!project) {
    return Response.json({ error: "Not found or forbidden" }, { status: 404 })
  }

  const body = await request.json()
  const canvasJson = JSON.stringify(body)

  const blob = await put(`projects/${projectId}/canvas.json`, canvasJson, {
    contentType: "application/json",
    access: "private",
    allowOverwrite: true,
  })

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasBlobUrl: blob.url },
  })

  return Response.json({ url: blob.url })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params
  const project = await getProjectAccess(projectId, userId)
  if (!project) {
    return Response.json({ error: "Not found or forbidden" }, { status: 404 })
  }

  if (!project.canvasBlobUrl) {
    return Response.json({ nodes: [], edges: [] })
  }

  const result = await get(project.canvasBlobUrl, { access: "private" })
  if (!result || result.statusCode !== 200) {
    return Response.json({ nodes: [], edges: [] })
  }

  const reader = result.stream.getReader()
  const decoder = new TextDecoder()
  let text = ""
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    text += decoder.decode(value, { stream: true })
  }
  text += decoder.decode()

  const canvasData = JSON.parse(text)

  return Response.json(canvasData)
}
