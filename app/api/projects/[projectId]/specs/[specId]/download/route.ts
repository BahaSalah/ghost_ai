import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { get } from "@vercel/blob"

async function getProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; specId: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId, specId } = await params

  const project = await getProjectAccess(projectId, userId)
  if (!project) {
    return Response.json({ error: "Not found or forbidden" }, { status: 404 })
  }

  const spec = await prisma.projectSpec.findUnique({
    where: { id: specId },
  })

  if (!spec || spec.projectId !== projectId) {
    return Response.json({ error: "Spec not found" }, { status: 404 })
  }

  const blobResult = await get(spec.filePath, { access: "private" })
  if (!blobResult || blobResult.statusCode !== 200) {
    return Response.json({ error: "Failed to fetch spec content" }, { status: 500 })
  }

  const reader = blobResult.stream.getReader()
  const decoder = new TextDecoder()
  let content = ""
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    content += decoder.decode(value, { stream: true })
  }
  content += decoder.decode()

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="spec-${specId}.md"`,
    },
  })
}
