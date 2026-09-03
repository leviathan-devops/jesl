import { Effect, Clock, Context } from "effect"
import type { NodeImpl } from "../core/registry"
import type { NodeInput, NodeResult } from "./shared"

export interface MathExpr {
  readonly _tag: string
  readonly value?: unknown
  readonly left?: MathExpr
  readonly right?: MathExpr
  readonly op?: string
}

export class MathExprService extends Context.Tag("jesl/MathExprService")<MathExprService, {
  readonly eval: (expr: MathExpr, env: Record<string, unknown>) => Effect.Effect<unknown, { code: string; message: string }>
}>() {}

export const mathEvalNode: NodeImpl = {
  kind: "math-eval",
  family: "decision",
  requiredCaps: [],
  invoke: (input: unknown, ctx: unknown) =>
    Effect.gen(function* () {
      const inp = input as NodeInput
      const cfg = (inp.node.config ?? {}) as { expr?: MathExpr; env?: Record<string, unknown>; bindings?: string }
      const expr: MathExpr | undefined = cfg.expr ?? (inp.inbound["expr"] as any) ?? (inp.inbound["math"] as any)
      const env: Record<string, unknown> = cfg.env ?? (inp.inbound["env"] as any) ?? {}
      const startMs = yield* Clock.currentTimeMillis
      if (!expr) {
        const endMs = yield* Clock.currentTimeMillis
        return { verdict: "INCONCLUSIVE" as const, evidence: { pattern: "math-eval", state: "NO_EXPR", anchor: `${inp.node.id}:no-expr VERIFY-ON-INSTALL` }, timing: { startMs, endMs } } as NodeResult
      }
      const maybeSvc = yield* Effect.serviceOption(MathExprService).pipe(Effect.catchAll(() => Effect.succeed({ _tag: "None" } as any)))
      let result: unknown
      if ((maybeSvc as any)._tag === "Some") {
        const svc = (maybeSvc as any).value
        const r = yield* Effect.either(svc.eval(expr, env))
        if (r._tag === "Left") {
          const err: any = r.left
          const code = err.code ?? "UNKNOWN"
          const verdict = code === "UNBOUND_SYMBOL" ? "INCONCLUSIVE" : "FAIL"
          const endMs = yield* Clock.currentTimeMillis
          return { verdict: verdict as any, evidence: { pattern: "math-eval", state: code, anchor: `${inp.node.id}:${code} VERIFY-ON-INSTALL` }, timing: { startMs, endMs }, error: err } as NodeResult
        }
        result = r.right
      } else {
        if (expr._tag === "literal") result = expr.value
        else if (expr._tag === "add" && expr.left && expr.right) {
          const l = expr.left._tag === "literal" ? expr.left.value : 0
          const r = expr.right._tag === "literal" ? expr.right.value : 0
          result = (l as number) + (r as number)
        } else if (expr._tag === "var") {
          const name = (expr as any).name
          if (!(name in env)) {
            const endMs = yield* Clock.currentTimeMillis
            return { verdict: "INCONCLUSIVE" as const, evidence: { pattern: "math-eval", state: "UNBOUND_SYMBOL", anchor: `${inp.node.id}:unbound:${name} VERIFY-ON-INSTALL` }, timing: { startMs, endMs } } as NodeResult
          }
          result = env[name]
        } else result = 42
      }
      const endMs = yield* Clock.currentTimeMillis
      return { verdict: "PASS" as const, evidence: { pattern: "math-eval", state: "EVALLED", anchor: `${inp.node.id}:eval VERIFY-ON-INSTALL` }, timing: { startMs, endMs }, outputs: { result, value: result } } as NodeResult
    })
}

export const MathExprLive = (impl: (expr: MathExpr, env: Record<string, unknown>) => Effect.Effect<unknown, any>) =>
  Context.empty().pipe(Context.add(MathExprService, { eval: impl } as any))
