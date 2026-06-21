import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getProjectForUser } from "@/lib/project-access"
import { AccessDenied } from "@/components/editor/access-denied"
import { WorkspaceContent } from "@/components/editor/workspace-content"
import { WorkspaceRegistration } from "@/components/editor/workspace-registration"

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { roomId } = await params
  const project = await getProjectForUser(roomId, userId)

  if (!project) return <AccessDenied />

  return (
    <>
      <WorkspaceRegistration
        projectId={project.id}
        projectName={project.name}
        projectRole={project.role}
      />
      <WorkspaceContent />
    </>
  )
}
