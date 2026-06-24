"use client"

import { useOthers } from "@liveblocks/react"
import { useUser } from "@clerk/nextjs"
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"

export function CollaboratorAvatars() {
  const { user } = useUser()
  const others = useOthers()
  const filtered = others.filter((o) => o.id !== user?.id)
  const MAX = 5
  const visible = filtered.slice(0, MAX)
  const overflow = filtered.length - MAX

  if (filtered.length === 0) return null

  return (
    <AvatarGroup>
      {visible.map((other) => {
        const name = other.info?.name ?? "Anonymous"
        const initials = name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)

        return (
          <Avatar key={other.id} size="sm">
            {other.info?.avatar ? (
              <AvatarImage src={other.info.avatar} alt={name} />
            ) : null}
            <AvatarFallback>{initials || "?"}</AvatarFallback>
          </Avatar>
        )
      })}
      {overflow > 0 && (
        <AvatarGroupCount>+{overflow}</AvatarGroupCount>
      )}
    </AvatarGroup>
  )
}
