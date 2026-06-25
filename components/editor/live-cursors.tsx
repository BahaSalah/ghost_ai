"use client"

import { useOthers } from "@liveblocks/react"
import { useUser } from "@clerk/nextjs"
import { Loader2 } from "lucide-react"

export function LiveCursors() {
  const { user } = useUser()
  const others = useOthers()
  const filtered = others.filter((o) => o.id !== user?.id)

  return (
    <>
      {filtered.map((other) => {
        const cursor = other.presence?.cursor
        if (!cursor) return null
        const color = other.info?.color ?? "#fff"
        const name = other.info?.name ?? "Anonymous"
        const isThinking = other.presence?.isThinking ?? false

        return (
          <div
            key={other.id}
            className="pointer-events-none fixed z-[100]"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: "translate(-2px, -2px)",
            }}
          >
            <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
              <path
                d="M2 1.5C2 0.947715 1.55228 0.5 1 0.5C0.447715 0.5 0 0.947715 0 1.5V14.5C0 15.0523 0.447715 15.5 1 15.5C1.55228 15.5 2 15.0523 2 14.5V9.5C2 8.94772 2.44772 8.5 3 8.5H10.5C11.0523 8.5 11.5 8.05228 11.5 7.5C11.5 6.94772 11.0523 6.5 10.5 6.5H3C2.44772 6.5 2 6.05228 2 5.5V1.5Z"
                fill={color}
              />
            </svg>
            <span
              className="absolute left-4 top-0 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap"
              style={{ background: color, color: "#000" }}
            >
              {isThinking && <Loader2 className="size-2.5 animate-spin shrink-0" />}
              {name}
            </span>
          </div>
        )
      })}
    </>
  )
}
