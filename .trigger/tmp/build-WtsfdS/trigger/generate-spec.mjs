import {
  external_exports,
  generateText,
  google
} from "../chunk-BKQUMGBL.mjs";
import "../chunk-KSQCY2GL.mjs";
import "../chunk-3UDJ4GFA.mjs";
import {
  metadata,
  task
} from "../chunk-3O2NIRTJ.mjs";
import "../chunk-USHNXJ63.mjs";
import "../chunk-WB4TRREF.mjs";
import {
  logger
} from "../chunk-BOOZZBO4.mjs";
import "../chunk-IB4V73K4.mjs";
import {
  __name,
  init_esm
} from "../chunk-244PAGAH.mjs";

// trigger/generate-spec.ts
init_esm();
var specPayloadSchema = external_exports.object({
  projectId: external_exports.string().min(1),
  roomId: external_exports.string().min(1),
  chatHistory: external_exports.array(external_exports.object({
    role: external_exports.enum(["user", "assistant"]),
    content: external_exports.string()
  })).default([]),
  nodes: external_exports.array(external_exports.any()).default([]),
  edges: external_exports.array(external_exports.any()).default([])
});
var generateSpec = task({
  id: "generate-spec",
  maxDuration: 300,
  retry: {
    maxAttempts: 3,
    factor: 1.8,
    minTimeoutInMs: 1e3,
    maxTimeoutInMs: 3e4,
    randomize: true
  },
  run: /* @__PURE__ */ __name(async (payload) => {
    const parsed = specPayloadSchema.parse(payload);
    const { projectId, roomId, chatHistory, nodes, edges } = parsed;
    logger.log("Starting spec generation", { projectId, roomId, nodeCount: nodes.length, edgeCount: edges.length });
    metadata.set("status", "analyzing");
    metadata.set("progress", 10);
    const nodeDescriptions = nodes.map((n, i) => {
      const data = n.data ?? {};
      return `${i + 1}. "${data.label ?? "Unlabeled"}" (${data.shape ?? "rectangle"}, color: ${data.color ?? "#505068"}) — position (${n.position?.x ?? "?"}, ${n.position?.y ?? "?"})`;
    }).join("\n");
    const edgeDescriptions = edges.map((e, i) => {
      const data = e.data ?? {};
      const label = data.label ? ` labeled "${data.label}"` : "";
      return `${i + 1}. "${e.source ?? "?"}" → "${e.target ?? "?"}"${label}`;
    }).join("\n");
    const chatContext = chatHistory.length > 0 ? `

## Design Discussion

${chatHistory.map((m) => `**${m.role === "user" ? "User" : "AI"}**: ${m.content}`).join("\n\n")}` : "";
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

Be thorough and technical. Use proper Markdown formatting with headings, lists, code blocks, and tables where appropriate.`;
    metadata.set("status", "generating");
    metadata.set("progress", 50);
    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system: "You are an expert technical architect writing precise, well-structured Markdown specification documents.",
      prompt
    });
    const spec = result.text;
    metadata.set("status", "complete");
    metadata.set("progress", 100);
    logger.log("Spec generation complete", { projectId, roomId, specLength: spec.length });
    return { spec };
  }, "run")
});
export {
  generateSpec
};
//# sourceMappingURL=generate-spec.mjs.map
