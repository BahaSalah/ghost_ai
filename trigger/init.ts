import { tasks } from "@trigger.dev/sdk"

tasks.onStartAttempt(({ ctx, task }) => {
  console.log(`Run ${ctx.run.id} started on task ${task}`)
})

tasks.onSuccess(({ ctx, task }) => {
  console.log(`Run ${ctx.run.id} succeeded on task ${task}`)
})

tasks.onFailure(({ ctx, task, error }) => {
  console.error(`Run ${ctx.run.id} failed on task ${task}:`, error)
})
