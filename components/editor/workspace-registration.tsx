"use client"

import { useEffect } from "react"
import { useWorkspaceBridge } from "./workspace-context"

export function WorkspaceRegistration({
  projectId,
  projectName,
  projectRole,
}: {
  projectId: string
  projectName: string
  projectRole: "owner" | "collaborator"
}) {
  const { setProjectId, setProjectName, setProjectRole } = useWorkspaceBridge()

  useEffect(() => {
    setProjectId(projectId)
    setProjectName(projectName)
    setProjectRole(projectRole)
    return () => {
      setProjectId(null)
      setProjectName(null)
      setProjectRole(null)
    }
  }, [projectId, projectName, projectRole, setProjectId, setProjectName, setProjectRole])

  return null
}
