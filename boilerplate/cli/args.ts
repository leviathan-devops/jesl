export interface ParsedArgs {
  command: "run" | "validate" | "replay" | "help"
  docPath?: string
  journalPath?: string
  varsPath?: string
  driver?: string
  help?: boolean
  raw: string[]
}

export function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2)
  const raw = argv.slice(2)
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    return { command: "help", help: true, raw }
  }
  const cmd = args[0]!
  if (cmd === "run") {
    const docPath = args[1]
    let varsPath: string | undefined
    let driver: string | undefined
    for (let i = 2; i < args.length; i++) {
      const a = args[i]!
      if (a === "--in" && i + 1 < args.length) {
        varsPath = args[i + 1]
        i++
      } else if (a.startsWith("--in=")) {
        varsPath = a.slice(5)
      } else if (a === "--driver" && i + 1 < args.length) {
        driver = args[i + 1]
        i++
      } else if (a.startsWith("--driver=")) {
        driver = a.slice(9)
      } else if (a === "--help" || a === "-h") {
        return { command: "help", help: true, raw }
      }
    }
    return { command: "run", docPath, varsPath, driver: driver ?? "cli", raw }
  }
  if (cmd === "validate") {
    const docPath = args[1]
    return { command: "validate", docPath, raw }
  }
  if (cmd === "replay") {
    const journalPath = args[1]
    return { command: "replay", journalPath, raw }
  }
  return { command: "help", help: true, raw }
}

export function helpText(): string {
  return `jesl — JSON Effect Scripting Language
Usage:
  jesl run <doc.json> [--in vars.json] [--driver cli|test]
  jesl validate <doc.json>
  jesl replay <journal-file>
  jesl --help
`
}
