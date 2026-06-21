import { auth } from "@clerk/nextjs/server"
import { getUserProjects } from "@/lib/project-data"
import { EditorShell } from "@/components/editor/editor-shell"

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  const initialProjects = userId ? await getUserProjects(userId) : { owned: [], shared: [] }

  return <EditorShell initialProjects={initialProjects}>{children}</EditorShell>
}
