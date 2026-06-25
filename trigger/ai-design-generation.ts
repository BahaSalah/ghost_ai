import { task, logger } from "@trigger.dev/sdk"

export interface DesignGenerationPayload {
  prompt: string
  projectId: string
  roomId: string
  userId: string
  currentNodes: unknown[]
  currentEdges: unknown[]
}

export interface DesignGenerationOutput {
  nodes: unknown[]
  edges: unknown[]
  summary: string
}

export const aiDesignGeneration = task({
  id: "ai-design-generation",
  maxDuration: 600,
  queue: {
    concurrencyLimit: 5,
  },
  run: async (payload: DesignGenerationPayload): Promise<DesignGenerationOutput> => {
    const { prompt, projectId, roomId, userId } = payload

    logger.log("Starting AI design generation", { prompt, projectId, roomId, userId })

    // TODO: Wire up AI provider (e.g., OpenAI, Anthropic) to generate nodes/edges
    // from the user prompt and current canvas state.

    // Placeholder: return empty result for now
    logger.log("AI design generation complete", { projectId })

    return {
      nodes: [],
      edges: [],
      summary: `Design generated from prompt: "${prompt}"`,
    }
  },
})
