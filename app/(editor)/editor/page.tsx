import { auth } from "@clerk/nextjs/server"
import { getUserProjects } from "@/lib/project-data"
import { EditorHomeClient } from "./editor-home-client"

export default async function EditorPage() {
  const { userId } = await auth()
  const projects = userId ? await getUserProjects(userId) : { owned: [], shared: [] }

  return <EditorHomeClient ownedCount={projects.owned.length} sharedCount={projects.shared.length} />
}
