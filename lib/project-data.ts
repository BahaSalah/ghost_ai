import { prisma } from "@/lib/prisma"
import { clerkClient } from "@clerk/nextjs/server"

export interface ProjectItem {
  id: string
  name: string
  role: "owner" | "collaborator"
}

export async function getUserProjects(userId: string): Promise<{
  owned: ProjectItem[]
  shared: ProjectItem[]
}> {
  const owned = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true },
  })

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const email = user.emailAddresses[0]?.emailAddress

  let shared: ProjectItem[] = []
  if (email) {
    const collaborations = await prisma.projectCollaborator.findMany({
      where: { email },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    shared = collaborations.map((c) => ({
      id: c.project.id,
      name: c.project.name,
      role: "collaborator" as const,
    }))
  }

  return {
    owned: owned.map((p) => ({
      id: p.id,
      name: p.name,
      role: "owner" as const,
    })),
    shared,
  }
}
