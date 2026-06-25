import { task, logger } from "@trigger.dev/sdk"

export const helloWorldTask = task({
  id: "hello-world",
  run: async (payload: { message: string }) => {
    logger.log("Hello world task running!", { payload })
    return { greeting: `Hello, ${payload.message}!` }
  },
})
