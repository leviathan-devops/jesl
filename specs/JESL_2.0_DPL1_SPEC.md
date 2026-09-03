# BUILD SPEC ARTIFACT — JESL 2.0 (MacroKernel Edition v2.0)

**Target:** `Effect_Runtime_Kernels/jesl/` → shipped as `JESL-Kernel-Edition-2.0`
**Generated:** 2026-09-03T16:00+04
**Trident Version:** v4.4.3
**Status:** PLANNING
**Artifact Type:** BUILD_SPEC (Layer 1 Prompt)
**Discovery:** ENABLED — 109 .ts files, 12,000+ lines, all modules measured

---

## §1 PROBLEM STATEMENT

The JESL kernel v1.0 is battle-tested: 336/336 tests, tsc 0, 4 container checkpoints, zero spec drift through 10 waves. But the boilerplate has three adoption-blocking gaps:

**GAP 1 — NODE COVERAGE (42%):** 21 of 37 registered kinds return INCONCLUSIVE with TODO anchors (nodes/stubs.ts:18-43). A spell using oracle-gate, evidence-gate, circuit-breaker, or any of 18 other kinds casts to nothing.

**GAP 2 — NO REAL LLM BINDING:** the prompt node's llm mode (nodes/prompt.ts:87-223) requires the Llm cap, but no production LlmLive exists. @effect/ai 0.37.0 installed, never imported. Tier-2 spells cannot generate.

**GAP 3 — NO CARD ROLODEX:** the spellcasting knowledge library documents cards, a rolodex, lexicon families, and composition tooling — none exists as code. Authoring requires hand-writing JSON with deep registry knowledge.

**Mission:** close all three gaps. JESL 2.0 = all 37 kinds working + real model binding + card rolodex + algorithm packager + flat boilerplate.

<!-- DPL1-CHUNK-2 -->
## §2 ARCHITECTURE

<!-- DPL1-CHUNK-3 -->
## §3 DISCOVERY INTELLIGENCE

<!-- DPL1-CHUNK-4 -->
## §4 CORE INSIGHT

<!-- DPL1-CHUNK-5 -->
## §5 SCOPE (expanded: the wave plan)

<!-- DPL1-CHUNK-6 -->
## §6 SUCCESS CRITERIA

<!-- DPL1-CHUNK-7 -->
## §7 CONTAINER TEST PLAN

<!-- DPL1-CHUNK-8 -->
## §8 THE 21 STUB IMPLEMENTATION SPECS

<!-- DPL1-CHUNK-9 -->
## §9 THE LlmLive ARCHITECTURE

<!-- DPL1-CHUNK-10 -->
## §10 THE CARD ROLODEX ARCHITECTURE

<!-- DPL1-CHUNK-11 -->
## §11 THE ALGORITHM PACKAGER

<!-- DPL1-CHUNK-12 -->
## §12 THE REMEDIATION (tsconfig + flatten + @ts-nocheck)

<!-- DPL1-CHUNK-13 -->
## §13 THE WAVE PLAN + DEPENDENCY DAG

<!-- DPL1-CHUNK-14 -->
## §14 THE INVARIANT PROOFS

<!-- DPL1-CHUNK-EOF -->
