import { task, logger } from "@trigger.dev/sdk"
import { Liveblocks, LiveList, LiveObject, LsonObject } from "@liveblocks/node"
import { mutateFlow } from "@liveblocks/react-flow/node"
import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"
import type { Node, Edge } from "@xyflow/react"
import type { AiStatusPayload } from "@/types/tasks"

const NODE_COLORS = ["#1F1F1F", "#10233D", "#2E1938", "#331B00", "#3C1618", "#3A1726", "#0F2E18", "#062822"] as const
const NODE_SHAPES = ["rectangle", "pill", "circle", "diamond", "hexagon", "cylinder"] as const

const actionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("add-node"), id: z.string(), label: z.string(), shape: z.enum(NODE_SHAPES), color: z.string(), x: z.number(), y: z.number() }),
  z.object({ type: z.literal("move-node"), nodeId: z.string(), x: z.number(), y: z.number() }),
  z.object({ type: z.literal("resize-node"), nodeId: z.string(), width: z.number(), height: z.number() }),
  z.object({ type: z.literal("update-node"), nodeId: z.string(), label: z.string().optional(), color: z.string().optional(), shape: z.enum(NODE_SHAPES).optional() }),
  z.object({ type: z.literal("delete-node"), nodeId: z.string() }),
  z.object({ type: z.literal("add-edge"), id: z.string(), source: z.string(), target: z.string(), label: z.string().optional() }),
  z.object({ type: z.literal("delete-edge"), edgeId: z.string() }),
])

const designPlanSchema = z.object({
  reasoning: z.string(),
  actions: z.array(actionSchema),
})

function isValidColor(c: string): boolean {
  return (NODE_COLORS as readonly string[]).includes(c)
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

async function pushStatus(liveblocks: Liveblocks, roomId: string, message: string, step: AiStatusPayload["step"]) {
  const payload: AiStatusPayload = { message, step, timestamp: Date.now() }

  try {
    await liveblocks.mutateStorage(roomId, ({ root }) => {
      let feed = root.get("aiStatusFeed")
      if (!feed) {
        feed = new LiveList([])
        root.set("aiStatusFeed", feed)
      }
      (feed as LiveList<LiveObject<LsonObject>>).push(new LiveObject(payload as unknown as LsonObject))
    })
  } catch (e) {
    logger.error("Failed to write to status feed", { error: String(e) })
  }

  liveblocks.broadcastEvent(roomId, { type: "ai-status", ...payload }).catch((e) => {
    logger.error("Failed to broadcast event", { error: String(e) })
  })
}

export const designAgent = task({
  id: "design-agent",
  maxDuration: 300,
  run: async (payload: { prompt: string; roomId: string; userId?: string }) => {
    const { prompt, roomId, userId } = payload

    const secret = process.env.LIVEBLOCKS_SECRET_KEY
    if (!secret) {
      logger.error("LIVEBLOCKS_SECRET_KEY is not set")
      throw new Error("LIVEBLOCKS_SECRET_KEY is not set")
    }
    const liveblocks = new Liveblocks({ secret })

    if (userId) {
      liveblocks.setPresence(roomId, { userId, data: { isThinking: true } }).catch((e) => {
        logger.error("Failed to set presence", { error: String(e) })
      })
    }

    await pushStatus(liveblocks, roomId, "Analyzing your prompt...", "start")

    try {
      await pushStatus(liveblocks, roomId, "Interpreting system design...", "processing")

      const nodeShapes = NODE_SHAPES.join(", ")
      const colorList = NODE_COLORS.join(", ")

      let nodeContext = ""
      try {
        const storage = await liveblocks.getStorageDocument(roomId, "json")
        const flow = (storage as Record<string, unknown>)?.flow as Record<string, unknown> | undefined
        const nodes = (flow?.nodes as Record<string, unknown> | undefined) ?? {}
        const edges = (flow?.edges as Record<string, unknown> | undefined) ?? {}
        const nodeList = Object.values(nodes)
        const edgeList = Object.values(edges)
        if (nodeList.length > 0 || edgeList.length > 0) {
          nodeContext = `Current canvas has ${nodeList.length} nodes and ${edgeList.length} edges.`
        }
      } catch {
        nodeContext = "Canvas is empty."
      }

      const systemPrompt = `You are an AI system design architect. Generate a plan to modify a collaborative canvas.

Available node shapes: ${nodeShapes}
Available colors (hex): ${colorList}

ACTION TYPE MUST be exactly one of: "add-node", "move-node", "resize-node", "update-node", "delete-node", "add-edge", "delete-edge"

EXAMPLES of each action:
- add-node: { "type": "add-node", "id": "ai-api-gateway-1", "label": "API Gateway", "shape": "rectangle", "color": "#10233D", "x": 100, "y": 100 }
- move-node: { "type": "move-node", "nodeId": "existing-node-id", "x": 300, "y": 200 }
- resize-node: { "type": "resize-node", "nodeId": "existing-node-id", "width": 200, "height": 80 }
- update-node: { "type": "update-node", "nodeId": "existing-node-id", "label": "New Label", "color": "#2E1938" }
- delete-node: { "type": "delete-node", "nodeId": "existing-node-id" }
- add-edge: { "type": "add-edge", "id": "e-src-tgt", "source": "node1-id", "target": "node2-id", "label": "HTTP" }
- delete-edge: { "type": "delete-edge", "edgeId": "existing-edge-id" }

Rules:
- The "type" field MUST be exactly one of the 7 strings listed above — not camelCase, not underscored, exactly as shown
- Use only the available shapes and colors listed above
- Place nodes with reasonable spacing (200-300px apart horizontally, 150-200px vertically)
- New node IDs must use the format "ai-<name>-<number>" (e.g. "ai-api-gateway-1")
- Edge IDs must use the format "e-<source>-<target>"
- Keep labels short and descriptive (1-4 words)
- When referencing existing nodes in move/resize/update/delete actions, use their exact IDs
- For delete actions, only delete nodes that exist in the current canvas
${nodeContext}`

      const userMessage = `User request: ${prompt}\n\nGenerate the actions to update the canvas.`

      const result = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: designPlanSchema,
        system: systemPrompt,
        prompt: userMessage,
        experimental_repairText: async ({ text, error }) => {
          logger.log("Repairing invalid model output", { error: error.message })
          try {
            const parsed = JSON.parse(text)
            if (parsed?.actions && Array.isArray(parsed.actions)) {
              const fixed = parsed.actions.map((a: Record<string, unknown>) => {
                const t = String(a.type ?? "").toLowerCase().replace(/_/g, "-")
                if (["add-node","move-node","resize-node","update-node","delete-node","add-edge","delete-edge"].includes(t)) {
                  return { ...a, type: t }
                }
                return a
              })
              return JSON.stringify({ ...parsed, actions: fixed })
            }
          } catch {}
          return null
        },
      })

      const { reasoning, actions } = result.object
      logger.log("Gemini reasoning", { reasoning })
      logger.log("Actions generated", { count: actions.length })

      await pushStatus(liveblocks, roomId, `Applying ${actions.length} changes...`, "processing")

      await mutateFlow<Node, Edge>({ client: liveblocks, roomId }, (flow) => {
        for (const action of actions) {
          switch (action.type) {
            case "add-node": {
              const color = isValidColor(action.color) ? action.color : NODE_COLORS[0]
              flow.addNode({
                id: action.id,
                type: "canvasNode",
                position: { x: clamp(action.x, 0, 10000), y: clamp(action.y, 0, 10000) },
                data: { label: action.label, color, shape: action.shape },
                width: 160,
                height: 60,
              })
              break
            }
            case "move-node": {
              flow.updateNode(action.nodeId, {
                position: { x: clamp(action.x, 0, 10000), y: clamp(action.y, 0, 10000) },
              })
              break
            }
            case "resize-node": {
              flow.updateNode(action.nodeId, {
                width: clamp(action.width, 40, 1000),
                height: clamp(action.height, 30, 1000),
              })
              break
            }
            case "update-node": {
              const updates: Record<string, unknown> = {}
              if (action.label) updates.label = action.label
              if (action.color && isValidColor(action.color)) updates.color = action.color
              if (action.shape) updates.shape = action.shape
              flow.updateNodeData(action.nodeId, updates)
              break
            }
            case "delete-node": {
              flow.removeNode(action.nodeId)
              break
            }
            case "add-edge": {
              flow.addEdge({
                id: action.id,
                source: action.source,
                target: action.target,
                type: "canvasEdge",
                data: action.label ? { label: action.label } : {},
              })
              break
            }
            case "delete-edge": {
              flow.removeEdge(action.edgeId)
              break
            }
            default:
              logger.warn("Unknown action type skipped", { type: (action as Record<string, unknown>).type })
          }
        }
      })

      if (userId) {
        liveblocks.setPresence(roomId, { userId, data: { isThinking: false } }).catch((e) => {
          logger.error("Failed to clear presence", { error: String(e) })
        })
      }

      await pushStatus(liveblocks, roomId, "Design complete!", "complete")
      logger.log("Canvas updated successfully", { roomId, actionCount: actions.length })

      return { success: true, actionCount: actions.length }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      logger.error("Design agent failed", { error: msg })
      if (userId) {
        liveblocks.setPresence(roomId, { userId, data: { isThinking: false } }).catch((e) => {
          logger.error("Failed to clear presence on error", { error: String(e) })
        })
      }
      await pushStatus(liveblocks, roomId, `Error: ${msg}`, "error")
      throw error
    }
  },
})
