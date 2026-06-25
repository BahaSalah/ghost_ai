import { task, logger, metadata } from "@trigger.dev/sdk"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { z } from "zod"
import { put } from "@vercel/blob"
import { prisma } from "@/lib/prisma"

const specPayloadSchema = z.object({
  projectId: z.string().min(1),
  roomId: z.string().min(1),
  chatHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).default([]),
  nodes: z.array(z.any()).default([]),
  edges: z.array(z.any()).default([]),
})

export const generateSpec = task({
  id: "generate-spec",
  maxDuration: 300,
  retry: {
    maxAttempts: 3,
    factor: 1.8,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000,
    randomize: true,
  },
  run: async (payload: z.infer<typeof specPayloadSchema>) => {
    const parsed = specPayloadSchema.parse(payload)
    const { projectId, roomId, chatHistory, nodes, edges } = parsed

    logger.log("Starting spec generation", { projectId, roomId, nodeCount: nodes.length, edgeCount: edges.length })

    metadata.set("status", "analyzing")
    metadata.set("progress", 10)

    const nodeDescriptions = nodes.map((n: Record<string, unknown>, i: number) => {
      const data = (n.data as Record<string, unknown>) ?? {}
      return `${i + 1}. "${data.label ?? "Unlabeled"}" (${data.shape ?? "rectangle"}, color: ${data.color ?? "#505068"}) — position (${(n.position as Record<string, unknown>)?.x ?? "?"}, ${(n.position as Record<string, unknown>)?.y ?? "?"})`
    }).join("\n")

    const edgeDescriptions = edges.map((e: Record<string, unknown>, i: number) => {
      const data = (e.data as Record<string, unknown>) ?? {}
      const label = data.label ? ` labeled "${data.label}"` : ""
      return `${i + 1}. "${e.source ?? "?"}" → "${e.target ?? "?"}"${label}`
    }).join("\n")

    const chatContext = chatHistory.length > 0
      ? `\n\n## Design Discussion\n\n${chatHistory.map((m: { role: string; content: string }) => `**${m.role === "user" ? "User" : "AI"}**: ${m.content}`).join("\n\n")}`
      : ""

    const prompt = `You are a technical documentation expert. Convert the following system architecture into a comprehensive Markdown technical specification.

## Components (Nodes)

${nodeDescriptions || "No components defined yet."}

## Connections (Edges)

${edgeDescriptions || "No connections defined yet."}
${chatContext}

## Requirements

Write a Markdown technical specification with the following sections:

1. **Overview** — What does this system do? Summarize its purpose based on the components and chat context.
2. **Architecture Diagram** — A text-based diagram using ASCII or mermaid syntax showing the components and their connections.
3. **Component Descriptions** — For each component: its purpose, responsibilities, technology hints, and key characteristics.
4. **Data Flow** — How data moves through the system, including protocols and data formats implied by the edge labels.
5. **API / Integration Points** — The interfaces between components.
6. **Technical Decisions** — Rationale for the architecture choices visible in the graph.

Be thorough and technical. Use proper Markdown formatting with headings, lists, code blocks, and tables where appropriate.`

    metadata.set("status", "generating")
    metadata.set("progress", 50)

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system: "You are an expert technical architect writing precise, well-structured Markdown specification documents.",
      prompt,
    })

    const spec = result.text

    metadata.set("status", "saving")
    metadata.set("progress", 90)

    const blob = await put(`specs/${projectId}/${roomId}.md`, spec, {
      contentType: "text/markdown",
      access: "private",
      addRandomSuffix: true,
    })

    const specRecord = await prisma.projectSpec.create({
      data: {
        projectId,
        filePath: blob.url,
      },
    })

    metadata.set("status", "complete")
    metadata.set("progress", 100)

    logger.log("Spec generation complete", { projectId, roomId, specLength: spec.length, specId: specRecord.id, blobUrl: blob.url })

    return { spec, blobUrl: blob.url, specId: specRecord.id }
  },
})
