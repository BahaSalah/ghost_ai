import "server-only"
import { auth } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function getCurrentIdentity(): Promise<{ userId: string; email: string } | null> {
  const { userId } = await auth()
  if (!userId) return null

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const email = user.emailAddresses[0]?.emailAddress ?? ""

  return { userId, email }
}

export async function getProjectForUser(
  projectId: string,
  userId: string,
): Promise<{ id: string; name: string; role: "owner" | "collaborator" } | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, ownerId: true },
  })

  if (!project) return null
  if (project.ownerId === userId) {
    return { id: project.id, name: project.name, role: "owner" }
  }

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const email = user.emailAddresses[0]?.emailAddress
  if (!email) return null

  const collaborator = await prisma.projectCollaborator.findUnique({
    where: { projectId_email: { projectId, email } },
  })

  return collaborator ? { id: project.id, name: project.name, role: "collaborator" } : null
}
