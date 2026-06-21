import { auth, clerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

interface CollaboratorView {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
}

async function enrichCollaborators(
  collaborators: { id: string; email: string }[],
): Promise<CollaboratorView[]> {
  if (collaborators.length === 0) return []

  const emails = collaborators.map((c) => c.email)
  const client = await clerkClient()
  const users = await client.users.getUserList({ emailAddress: emails })

  const byEmail = new Map(
    users.data.map((u) => [
      u.emailAddresses[0]?.emailAddress,
      {
        displayName: [u.firstName, u.lastName].filter(Boolean).join(" ") || null,
        avatarUrl: u.imageUrl || null,
      },
    ]),
  )

  return collaborators.map((c) => {
    const clerk = byEmail.get(c.email)
    return {
      id: c.id,
      email: c.email,
      displayName: clerk?.displayName ?? null,
      avatarUrl: clerk?.avatarUrl ?? null,
    }
  })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  })
  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const isOwner = project.ownerId === userId
  if (!isOwner) {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const email = user.emailAddresses[0]?.emailAddress
    if (!email) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }
    const collaborator = await prisma.projectCollaborator.findUnique({
      where: { projectId_email: { projectId, email } },
    })
    if (!collaborator) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  const rows = await prisma.projectCollaborator.findMany({
    where: { projectId },
    select: { id: true, email: true },
    orderBy: { createdAt: "asc" },
  })

  const enriched = await enrichCollaborators(rows)
  return Response.json({ collaborators: enriched, isOwner })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  })
  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }
  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  let email: string | undefined
  try {
    const body = await request.json()
    if (typeof body.email === "string") {
      email = body.email.trim().toLowerCase()
    }
  } catch {}

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Valid email is required" }, { status: 400 })
  }

  const existing = await prisma.projectCollaborator.findUnique({
    where: { projectId_email: { projectId, email } },
  })
  if (existing) {
    return Response.json({ error: "Already a collaborator" }, { status: 409 })
  }

  const collaborator = await prisma.projectCollaborator.create({
    data: { projectId, email },
    select: { id: true, email: true },
  })

  const [enriched] = await enrichCollaborators([collaborator])
  return Response.json(enriched, { status: 201 })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  })
  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }
  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  let email: string | undefined
  try {
    const body = await request.json()
    if (typeof body.email === "string") {
      email = body.email.trim().toLowerCase()
    }
  } catch {}

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 })
  }

  const collaborator = await prisma.projectCollaborator.findUnique({
    where: { projectId_email: { projectId, email } },
  })
  if (!collaborator) {
    return Response.json({ error: "Collaborator not found" }, { status: 404 })
  }

  await prisma.projectCollaborator.delete({
    where: { projectId_email: { projectId, email } },
  })

  return new Response(null, { status: 204 })
}
