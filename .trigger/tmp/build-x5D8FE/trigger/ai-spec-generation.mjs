import {
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

// trigger/ai-spec-generation.ts
init_esm();
var aiSpecGeneration = task({
  id: "ai-spec-generation",
  maxDuration: 600,
  queue: {
    concurrencyLimit: 3
  },
  run: /* @__PURE__ */ __name(async (payload) => {
    const { projectId, specId, userId, nodes, edges } = payload;
    logger.log("Starting AI spec generation", { projectId, specId, userId });
    logger.log("AI spec generation complete", { projectId, specId });
    return {
      markdown: "",
      blobUrl: ""
    };
  }, "run")
});
export {
  aiSpecGeneration
};
//# sourceMappingURL=ai-spec-generation.mjs.map
