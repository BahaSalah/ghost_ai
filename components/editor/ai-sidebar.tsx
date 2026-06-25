"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Bot, X, FileText, Download, Send, Loader2, User, Clock } from "lucide-react"
import { useStorage, useMutation, useSelf } from "@liveblocks/react"
import { LiveObject } from "@liveblocks/client"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import ReactMarkdown from "react-markdown"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useWorkspaceBridge } from "./workspace-context"
import type { AiStatusPayload, AiChatMessage } from "@/types/tasks"

interface SpecItem {
  id: string
  createdAt: string
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function AiSidebar() {
  const { isAiOpen, setAiOpen, projectId } = useWorkspaceBridge()
  const params = useParams()
  const roomId = params.roomId as string | undefined

  const [activeTab, setActiveTab] = useState("architect")
  const [input, setInput] = useState("")
  const [runId, setRunId] = useState<string | null>(null)
  const [publicToken, setPublicToken] = useState<string | null>(null)

  const [specs, setSpecs] = useState<SpecItem[]>([])
  const [specsLoading, setSpecsLoading] = useState(false)
  const [specGenerating, setSpecGenerating] = useState(false)
  const [selectedSpec, setSelectedSpec] = useState<SpecItem | null>(null)
  const [specContent, setSpecContent] = useState("")
  const [specContentLoading, setSpecContentLoading] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)

  const self = useSelf()
  const senderName = self?.info?.name ?? "Anonymous"

  const statusFeed = useStorage((root) => root.aiStatusFeed)
  const latestStatus = statusFeed && statusFeed.length > 0
    ? (statusFeed[statusFeed.length - 1] as unknown as AiStatusPayload)
    : null

  const chatFeed = useStorage((root) => root.aiChatFeed)
  const chatMessages = (chatFeed ?? []) as unknown as AiChatMessage[]

  const addChatMessage = useMutation(
    ({ storage }, content: string, name: string, role: "user" | "assistant") => {
      const feed = storage.get("aiChatFeed")
      feed.push(new LiveObject({
        senderName: name,
        role,
        content,
        timestamp: Date.now(),
      }))
    },
    [],
  )

  const onRunComplete = useCallback(
    (_completedRun: unknown, err?: Error) => {
      if (err) {
        addChatMessage(`Error: ${err.message}`, "Ghost AI", "assistant")
      } else {
        addChatMessage("Design complete! Check the canvas for updates.", "Ghost AI", "assistant")
      }
      setRunId(null)
      setPublicToken(null)
    },
    [addChatMessage],
  )

  const { run } = useRealtimeRun(runId ?? undefined, {
    accessToken: publicToken ?? undefined,
    enabled: !!runId && !!publicToken,
    onComplete: onRunComplete,
  })

  const isRunActive = !!runId && !!publicToken && (
    !run || run.status === "QUEUED" || run.status === "EXECUTING"
  )

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages.length, isRunActive])

  useEffect(() => {
    if (activeTab !== "specs" || !projectId) return

    const fetchSpecs = async () => {
      setSpecsLoading(true)
      try {
        const res = await fetch(`/api/projects/${projectId}/specs`)
        if (res.ok) {
          setSpecs(await res.json())
        }
      } catch {
        // silently fail
      } finally {
        setSpecsLoading(false)
      }
    }

    fetchSpecs()
  }, [activeTab, projectId])

  const handleSpecClick = async (spec: SpecItem) => {
    setSelectedSpec(spec)
    setSpecContent("")
    setSpecContentLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/specs/${spec.id}/download`)
      if (res.ok) {
        setSpecContent(await res.text())
      } else {
        setSpecContent("Failed to load spec content.")
      }
    } catch {
      setSpecContent("Failed to load spec content.")
    } finally {
      setSpecContentLoading(false)
    }
  }

  const handleGenerateSpec = useCallback(async () => {
    if (!roomId || !projectId || specGenerating) return

    setSpecGenerating(true)
    try {
      const canvasRes = await fetch(`/api/projects/${projectId}/canvas`)
      let nodes: any[] = []
      let edges: any[] = []
      if (canvasRes.ok) {
        const canvas = await canvasRes.json()
        nodes = canvas.nodes ?? []
        edges = canvas.edges ?? []
      }

      const chatHistory = chatMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }))

      const res = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          chatHistory,
          nodes,
          edges,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Request failed" }))
        throw new Error(errData.error || `Request failed (${res.status})`)
      }

      const listRes = await fetch(`/api/projects/${projectId}/specs`)
      if (listRes.ok) {
        setSpecs(await listRes.json())
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error("Spec generation failed:", msg)
    } finally {
      setSpecGenerating(false)
    }
  }, [roomId, projectId, specGenerating, chatMessages])

  const closePreview = () => {
    setSelectedSpec(null)
    setSpecContent("")
  }

  const handleSubmit = async () => {
    const trimmed = input.trim()
    if (!trimmed || !roomId || isRunActive) return

    try {
      addChatMessage(trimmed, senderName, "user")
      setInput("")

      const res = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, roomId, projectId }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Request failed" }))
        throw new Error(errData.error || `Request failed (${res.status})`)
      }

      const { runId: newRunId, publicToken: newToken } = await res.json()
      setRunId(newRunId)
      setPublicToken(newToken)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      addChatMessage(`Error: ${msg}`, "Ghost AI", "assistant")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (!isAiOpen) return null

  return (
    <aside className="flex w-80 flex-col border-l border-border-default bg-base/95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="size-5 text-ai" />
          <div>
            <h2 className="text-sm font-semibold text-copy-primary">
              AI Workspace
            </h2>
            <p className="text-xs text-copy-muted">
              Collaborate with Ghost AI
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setAiOpen(false)}
          aria-label="Close AI sidebar"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col"
      >
        <TabsList variant="line" className="mx-3 mt-3 w-auto">
          <TabsTrigger
            value="architect"
            className="text-copy-muted data-active:bg-accent data-active:text-accent-foreground"
          >
            AI Architect
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="text-copy-muted data-active:bg-accent data-active:text-accent-foreground"
          >
            Specs
          </TabsTrigger>
        </TabsList>

        {/* AI Architect Tab */}
        <TabsContent value="architect" className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
            {chatMessages.length > 0 || latestStatus || isRunActive ? (
              <>
                <div className="flex flex-col gap-2">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 rounded-lg px-3 py-2 ${
                        msg.role === "user"
                          ? "bg-[#62C073]"
                          : "bg-elevated"
                      }`}
                    >
                      <div className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                        msg.role === "user" ? "bg-black/20" : "bg-subtle"
                      }`}>
                        <User className={`size-3 ${
                          msg.role === "user" ? "text-[#0a0a0a]" : "text-copy-muted"
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-xs font-medium ${
                            msg.role === "user" ? "text-[#0a0a0a]" : "text-copy-primary"
                          }`}>
                            {msg.senderName}
                          </span>
                          <span className={`text-[10px] ${
                            msg.role === "user" ? "text-[#0a0a0a]/60" : "text-copy-muted"
                          }`}>
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <p className={`mt-0.5 text-xs break-words ${
                          msg.role === "user" ? "text-[#0a0a0a]" : "text-copy-secondary"
                        }`}>
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div ref={chatEndRef} />
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <Bot className="size-10 text-ai" />
                <p className="text-sm text-copy-secondary">
                  Ask Ghost AI to design your architecture.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setInput(prompt)}
                      className="rounded-full bg-subtle px-3 py-1.5 text-xs text-ai-text transition-colors hover:bg-subtle/80"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status strip */}
          {isRunActive && latestStatus && (
            <div className="flex items-center gap-2 border-t border-border-default bg-base px-3 py-1.5 text-xs">
              <span className="size-1.5 rounded-full bg-[#62C073] animate-pulse" />
              <span className="text-copy-muted">{latestStatus.message}</span>
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-border-default p-3">
            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI..."
                className="min-h-[72px] max-h-[160px] resize-none pr-10"
                disabled={isRunActive}
              />
              <Button
                size="icon-sm"
                className={`absolute right-1.5 bottom-1.5 ${
                  isRunActive
                    ? "bg-[#62C073]/50 text-white cursor-not-allowed"
                    : "bg-[#62C073] text-white hover:bg-[#62C073]/90"
                }`}
                onClick={handleSubmit}
                disabled={isRunActive || !input.trim()}
                aria-label="Send message"
              >
                {isRunActive ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent value="specs" className="flex flex-1 flex-col p-3">
          <Button
            className="w-full"
            onClick={handleGenerateSpec}
            disabled={specGenerating}
          >
            {specGenerating ? (
              <>
                <Loader2 className="mr-1.5 size-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Spec"
            )}
          </Button>

          <div className="mt-3 flex flex-1 flex-col gap-2">
            {specsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-copy-muted" />
              </div>
            ) : specs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="size-8 text-copy-muted" />
                <p className="mt-2 text-sm text-copy-secondary">No specs generated yet.</p>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="flex flex-col gap-2">
                  {specs.map((spec) => (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => handleSpecClick(spec)}
                      className="flex w-full items-center gap-3 rounded-lg bg-elevated p-3 text-left ring-1 ring-border-default transition-colors hover:bg-elevated/80"
                    >
                      <FileText className="size-4 shrink-0 text-ai" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-copy-primary truncate">
                          Spec {formatDate(spec.createdAt)}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-copy-muted">
                          <Clock className="size-3" />
                          {formatDate(spec.createdAt)}
                        </p>
                      </div>
                      <a
                        href={`/api/projects/${projectId}/specs/${spec.id}/download`}
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 rounded-md p-1.5 text-copy-muted transition-colors hover:text-copy-primary"
                        aria-label="Download spec"
                      >
                        <Download className="size-4" />
                      </a>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      <Dialog open={!!selectedSpec} onOpenChange={(open) => { if (!open) closePreview() }}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedSpec ? `Spec ${formatDate(selectedSpec.createdAt)}` : "Spec Preview"}
            </DialogTitle>
            <DialogDescription>
              Generated technical specification for this project.
            </DialogDescription>
          </DialogHeader>
          {specContentLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-copy-muted" />
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="prose prose-invert prose-sm max-w-none px-1 pb-2">
                <ReactMarkdown>{specContent}</ReactMarkdown>
              </div>
            </ScrollArea>
          )}
          <div className="flex justify-end gap-2 pt-3 border-t border-border-default">
            <Button variant="outline" onClick={closePreview}>
              Close
            </Button>
            {selectedSpec && (
              <a
                href={`/api/projects/${projectId}/specs/${selectedSpec.id}/download`}
                download
              >
                <Button>
                  <Download className="mr-1.5 size-4" />
                  Download
                </Button>
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  )
}
