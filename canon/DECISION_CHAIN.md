# DECISION CHAIN — JESL (MacroKernel_Edition-v1.0)

## Purpose
The ruling ledger: every load-bearing decision as a verbatim statement + context + rationale + alternatives rejected + implications. APPEND-ONLY. When a law in COMPACTION_SURVIVAL conflicts with a newer ruling HERE, the newer ruling wins and the law updates at the next milestone.

## Entry Format
```
### D<n> — <title> (<date>, <source>)
- RULING (verbatim): "..."
- CONTEXT: ...
- RATIONALE: ...
- ALTERNATIVES REJECTED: ...
- IMPLICATIONS: ...
- ADDENDA: ...
```

## Entries

### D1 — THE LIBRARY IS THE PRODUCT (2026-09-01, the operator)
- RULING: "the 2 examples i gave are USE CASE TARGETS OF THE FULLY PRODUCTION GRADE LIBRARY. THROW THAT IN THE TRASH AND WIRE THE LIBRARY PROPERLY" (+ "LIBRARY ARCHITECTURE IS FUNDAMENTAL").
- CONTEXT: the JESL bible v1.0 had framed mechanical-tools / embedded-agents / the-library as three tiers of systems.
- RATIONALE: one production library; the asks are compositions — three systems would triplicate the substrate.
- ALTERNATIVES REJECTED: the three-tier framing (kept only as use-case families A/B/C).
- IMPLICATIONS: §0.3 reframed; Parts 3/4 renamed USE CASE A/B; the skill-launcher added as C; the tier discipline becomes schema-enforced (meta.tier).
- ADDENDA: v1.1 (the bible's 1119L state) implements this fully.

### D2 — SPEC-ONLY (2026-09-01 + 2026-09-02, the operator, ×2)
- RULING: "dont build it just spec it".
- CONTEXT: the DPL1, then the L2.
- RATIONALE: the canon before the code; the build is a dedicated wave.
- ALTERNATIVES REJECTED: scaffolding alongside the specs.
- IMPLICATIONS: the §8 handoff directives in both specs; every wave in WAVE_PLAN.md is frozen behind the BUILD GO; this chain records the go when it comes.

### D3 — THE PIPELINE INSERTION (2026-09-03, the operator)
- RULING: "engineer this based on the input pipeline laid out in [the v4.4.4 spec] and just add the Macro Kernels Prototype Shells as a step between MPSE + Code specs. MPSE specs --> macro kernel prototyps --> code specs".
- RATIONALE: the coverage matrix forces compose-vs-build before language decisions; the TestLive dry-run executes the deterministic substrate pre-code (D1–D9 surface at zero cost); code specs shrink to the delta.
- ALTERNATIVES REJECTED: MPSE→code directly (the v4.4.4 default).
- IMPLICATIONS: the spec→kernels lifecycle kernel (W8); the MPSE bridge (W7) is the insertion's executor; Stage 4 becomes delta-specification.

### D4 — SKILL ROCKETS (2026-09-03, the operator, the brain dump + the ruling)
- RULING: "skills as real time tool injectables / context / prompt / anti pattenrs / json schema / effict script prototype shells / pre-built engines for specific micro execution (ex: document writer, matrix calculator, etc) / testing criteria/pre-built test suite templates — Skill_Tools_V2" + "skills as the payload deliver for ephemeral-kernel-tools ('rockets' - one off execution) - skill rockets. kernel rockets."
- RATIONALE: the skill = the munition; the Effect kernel = the propulsion; ephemeral by design (fire → journal → die); drop-a-directory ships a tool.
- ALTERNATIVES REJECTED: registered tools (rebuild friction).
- IMPLICATIONS: the payload manifest (F26); the packager's emit skill; ask-launcher makes the firing agent a node.

### D5 — THE FOUR EFFECT LAYERS (2026-09-03, derived answering "where is the effect layered in here?")
- RULING (the answer, now doctrine): α pipeline self-hosting · β rocket propulsion · γ build supervision (Poseidon-as-Workflow; XState-as-projector) · δ the verification plane (TestLive).
- RATIONALE: Effect is not a pipeline stage — it is the substrate of every execution surface.
- ALTERNATIVES REJECTED: Effect as "a step"; deleting XState; running Poseidon in the interpreter.
- IMPLICATIONS: the v4.4.4 slotting (Layer-0 internals / 2 / 3; the shell immutable); DD13's projector pattern.

### D6 — THE WORKSPACE (2026-09-03, the operator)
- RULING: "use Active_Projects/JESL as the workspace move in all the specs and wave plans and setup canon docs per the skill".
- IMPLICATIONS: the 4 specs moved in (the bible stays external canon — the pointer in the manifest); WAVE_PLAN.md; this scaffold.

### D7–D21 — the engineering decision set (2026-09-01→03, carried verbatim from the L2's designDecisions input: DD1–DD24)
The full record lives in the L2's §1.5 + its designDecisions lineage — the load-bearing subset: D9 Effect-the-only-kernel · D10 caps=Layers · D11 durable-vs-ephemeral · D12 wrap-never-rewrite · D13 LSP-via-patch · DD13 XState-as-projector · DD14 the insertion · DD15 rockets · DD16 the four layers · DD17 the consolidation survivors · DD18 the canonical sig (timestamp+type INCLUDED) · DD19 escalation single-source · DD20 the ratio de-dup · DD21 the LASME G1 port · DD24 VERIFY-ON-INSTALL for the Effect API surfaces.

### D25 — THE BUILD GO (2026-09-03, the operator, via the post-compaction resume paste)
- RULING (verbatim): "Your job now: absorb it, then execute the wave plan W0→W10 to completion." + "ABSORB. THEN EXECUTE. Do not stop until the ship package is complete."
- CONTEXT: the operator pasted the post-compaction resume prompt (RESUME_PROMPT.md) into the fresh session after the full spec-set landed (the L2 5,290L post-audit + 3 companion specs + WAVE_PLAN + the 11-doc canon, baseline a4c8f19e).
- RATIONALE: the spec stage is COMPLETE; the prompt the operator authored and pasted mandates execution to completion; W0 is AUTHORIZED-BY-SPEC additive docs surgery — the lowest-risk possible first wave.
- ALTERNATIVES REJECTED: holding for a second explicit "go" (the permission round-trip the pasted mandate itself forbids — "Do not stop until the ship package is complete").
- IMPLICATIONS: ALL waves W0→W10 are GREEN per the dependency spine; Law 2 (SPEC-ONLY) is SATISFIED and retired; the wave gates + the 4 container checkpoints (W3/W5/W6/W10) remain the binding quality gates; scope = ALL waves.

## Anti-Patterns for This Doc
- NAPKIN: decisions without verbatim quotes. PADDING: rationale essays without implications. DRIFT: a law change without its ruling here → the cross-check: every COMPACTION_SURVIVAL law traces to a D-entry or the standing warheads.

## Fill Guidance
- When: per ruling (immediately). How: APPEND. Substance: verbatim quotes; implications name the files/docs touched.

## The Standing-Warhead Mapping (the identity-layer laws that need no D-entry — they predate the project)
| Warhead | In force here as |
|---|---|
| W9 (ISE) | Law 8 (Separation) + the detector/decider split in every node |
| W10 (loud-fail) | Law 7 + the FALLBACK TEST |
| W11 (allSettled) | the executor's forEach semantics (one failure never kills siblings) |
| W13 (evidence-before-claims) | Law 6 + EVIDENCE_STATE's proven-vs-claimed |
| W18 (basic-fucking-logic) | no compat shims hiding the kernel; no unrequested fallbacks |

## The Pending-Decision Register (the open calls that need the operator)
[FILL: as they arise]
| Question | Needed by | Default if unruled |
|---|---|---|
| THE BUILD GO | W0's dispatch | hold (Law 2) |
| The Codename↔V1 repo consolidation (one survives at ship) | W10 | both remain read-only wrap targets; defer |
| The platform package (@effect/platform-node vs -bun) | S1E/W2 | VERIFY-ON-INSTALL (DD24) — the runtime probe decides |

## The Ruling-Update Protocol
A new ruling: (1) append the D-entry verbatim; (2) update COMPACTION_SURVIVAL's law/doctrine at the NEXT milestone (never mid-wave); (3) note the blast radius here in IMPLICATIONS. Conflicts resolve newest-first.

## The Full D7–D24 Ledger (one line each — the L2 designDecisions is the authority)
| # | The decision |
|---|---|
| D7 | append-only registry + versioned $schema — v1 docs run forever |
| D8 | MathExpr as the IR — JESL math nodes compile to the 24-kind grammar; no parallel JSON expression language |
| D9 | Effect the only kernel — NodeImpl.invoke → Effect, never a raw Promise |
| D10 | caps = Context.Service; [JESL CAP-UNBOUND] = missing R |
| D11 | durable (Workflow.make) when: pause, ask-launcher, generation re-pay, Poseidon; scoped fibers otherwise |
| D12 | Paragon wraps — the math stays pure; Effect accumulates/actuates at the seam |
| D13 | Effect LSP via CLI + patch — never a tsserver fork |
| D14 | the pipeline insertion (MPSE → prototypes → code specs) |
| D15 | token stability — codecs migrate without renaming a [JESL ...] code |
| D16 | the four Effect layers (α β γ δ) |
| D17 | the consolidation survivors (one per mechanism) |
| D18 | the canonical sig: SHA-256 over {tool, args, exitCode, output, timestamp, type} |
| D19 | escalation single-source: ms-escalation-memory is the sole table |
| D20 | the ratio de-dup: intent imports ms-ratio; the inline copy dies |
| D21 | the LASME G1 port: source_change + status + isEventFresh + analyzeResult |
| D22 | lowest-composition — the fewest generative nodes |
| D23 | XState as projector — Effect is the execution truth |
| D24 | VERIFY-ON-INSTALL for the Effect API surfaces (the concept written; the import verified at S1E) |

### D26 — THE JESL RENAME (2026-09-03, the operator)
- RULING (verbatim): "we should also rename the E in JESL to Effect < Event so it is consistent and JESL kernels fits cleanly. JSON Effect Scripting Language"
- CONTEXT: JESL was originally "JSON Event Scripting Library" (D1 lineage). The kernel now runs on Effect-TS as the ONLY runtime (D9/D25). "Event" described the original hook-event architecture; "Effect" describes what actually powers the execution.
- RATIONALE: "JSON Effect Scripting Language" aligns the acronym with the runtime (Effect-TS), the Effect Laws (E1-E16), and the kernel's identity (Effect is the only kernel — there IS no event runtime). "Language" replaces "Library" because JESL defines a programming surface (nodes, edges, channels, config), not just a collection of utilities.
- ALTERNATIVES REJECTED: "JSON Effect Scripting Library" (Language is more accurate — JESL defines grammar + semantics + execution, not just a collection of functions).
- IMPLICATIONS: All docs, bibles, boilerplates, and canon references use "JSON Effect Scripting Language" going forward. The 8 frozen `[JESL ...]` tokens are UNCHANGED (D15: the token register is string-frozen). No code identifier changes. The JESL acronym stays J-E-S-L.
