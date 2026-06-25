import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

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

  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true },
  })

  return Response.json(specs)
}
