import { task, logger } from "@trigger.dev/sdk"

export interface SpecGenerationPayload {
  projectId: string
  specId: string
  userId: string
  nodes: unknown[]
  edges: unknown[]
}

export interface SpecGenerationOutput {
  markdown: string
  blobUrl: string
}

export const aiSpecGeneration = task({
  id: "ai-spec-generation",
  maxDuration: 600,
  queue: {
    concurrencyLimit: 3,
  },
  run: async (payload: SpecGenerationPayload): Promise<SpecGenerationOutput> => {
    const { projectId, specId, userId, nodes, edges } = payload

    logger.log("Starting AI spec generation", { projectId, specId, userId })

    // TODO: Wire up AI provider to convert the graph into a Markdown technical spec.
    // Persist the markdown to Vercel Blob and store the URL on the spec record.

    logger.log("AI spec generation complete", { projectId, specId })

    return {
      markdown: "",
      blobUrl: "",
    }
  },
})
