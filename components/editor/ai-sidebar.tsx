"use client"

import { useState } from "react"
import { Bot, X, FileText, Download, Send } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useWorkspaceBridge } from "./workspace-context"

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

export function AiSidebar() {
  const { isAiOpen, setAiOpen } = useWorkspaceBridge()
  const [activeTab, setActiveTab] = useState("architect")
  const [input, setInput] = useState("")

  const handleSubmit = () => {
    if (!input.trim()) return
    setInput("")
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
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center">
            <Bot className="size-10 text-ai" />
            <p className="text-sm text-copy-secondary">
              Ask Ghost AI to design your architecture.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="rounded-full bg-subtle px-3 py-1.5 text-xs text-ai-text transition-colors hover:bg-subtle/80"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div className="border-t border-border-default p-3">
            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI..."
                className="min-h-[72px] max-h-[160px] resize-none pr-10"
              />
              <Button
                size="icon-sm"
                className="absolute right-1.5 bottom-1.5 bg-accent text-white hover:bg-accent/90"
                onClick={handleSubmit}
                aria-label="Send message"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent value="specs" className="flex flex-1 flex-col p-3">
          <Button className="w-full bg-accent text-white hover:bg-accent/90">
            Generate Spec
          </Button>

          <div className="mt-3 flex flex-1 flex-col">
            <div className="flex flex-col gap-2 rounded-xl bg-elevated p-4 ring-1 ring-border-default">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-ai" />
                <span className="text-sm font-medium text-copy-primary">
                  API Gateway Spec
                </span>
              </div>
              <p className="text-xs text-copy-muted line-clamp-3">
                Defines the API gateway routes, rate limiting, authentication
                middleware, and upstream service routing for the platform.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 self-start text-copy-muted"
                disabled
              >
                <Download className="mr-1 size-3.5" />
                Download
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  )
}
