#!/usr/bin/env bun
import { Effect } from "effect"
import { parseArgs, helpText } from "./args"
import { dispatch } from "./handlers"

async function main() {
  const parsed = parseArgs(process.argv)
  if (parsed.command === "help" || parsed.help) {
    process.stdout.write(helpText())
    ;(process as any)["exit"](0)
  }
  if (parsed.command === "run" && !parsed.docPath) {
    // Law 5: [JESL UNKNOWN-NODE] means "unknown node kind" — usage errors are plain text, never frozen-token lookalikes.
    process.stderr.write("error: missing doc path — usage: jesl run <doc.json> [--in vars.json] [--driver cli|test]\n")
    ;(process as any)["exit"](2)
  }
  if (parsed.command === "validate" && !parsed.docPath) {
    process.stderr.write("error: missing doc path — usage: jesl validate <doc.json>\n")
    ;(process as any)["exit"](2)
  }
  if (parsed.command === "replay" && !parsed.journalPath) {
    process.stderr.write("error: missing journal path — usage: jesl replay <journal.json>\n")
    ;(process as any)["exit"](2)
  }
  const program = dispatch(parsed)
  const result = await Effect.runPromise(program)
  if (result.stdout) process.stdout.write(result.stdout.endsWith("\n") ? result.stdout : result.stdout + "\n")
  if (result.stderr) process.stderr.write(result.stderr.endsWith("\n") ? result.stderr : result.stderr + "\n")
  ;(process as any)["exit"](result.code)
}

main().catch((e: any) => {
  const msg = e?.message ?? String(e)
  const code = msg.includes("[JESL") ? 2 : 1
  process.stderr.write(msg + "\n")
  ;(process as any)["exit"](code)
})
