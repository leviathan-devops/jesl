# EFFECT SPELLCASTING BIBLE — THE SHARED MACRO MECHANICS OF MAGIC

> **TRIGGER:** Any agent building spell-like executable artifacts (JESL Effect Spells, Skill Rockets) or analyzing how magic systems actually compute casting. NOT a lore document — zero world-building, only the mechanics of idea/cause → effect → experienced effect.
> **DUTY:** Read fully. Then operate. This bible extracts the SHARED patterns every canonical system uses to script magic, then compiles them onto JESL + TDM.
> **PROTOCOL:** One-shot read, then execute P3-1..P3-5.
> **SOURCES (mechanics only):** UESP Lore:Magic + Skyrim:Magic Overview + Oblivion:Spell Making · Witcher Wiki: Magic · Inheriwiki: Magic + Ancient Language (used ONLY as the Effect-Scripting language reference) · TRIDENT_DECISION_MAKING_TOOL_SPEC.md (v4.4.3, 1,525L) · the JESL kernel (jesl/, 109 files).

**THE THREE SENTENCES OF DISCIPLINE:**
1. Every magic system computes the same triad — IDEA (structured intent) → EFFECT (a priced, validated pipeline of parameterized effect primitives) → EXPERIENCED EFFECT (a rendered, observable world-state change) — and differs only in its compiler and cost model.
2. Every spell in every system decomposes to the same primitive shape: `{effect-type, magnitude, duration, area, targeting}` composed in ordered pipelines with explicit stacking rules — the systems are all the same DSL with different syntax.
3. The experienced effect must be computed from what actually fired, never from what was intended — evidence over narration is the one law no system can skip.

---

## PART 1 — CRITICAL RULES (the shared mechanics law)

### 1A — THE TRIAD LAW
1. ALWAYS structure casting as three bound stages: IDEA → EFFECT → EXPERIENCED EFFECT. All analyzed systems separate acquire → structure → price → release → render → settle → record; none merge them.
2. NEVER let the intent stage write the experience stage. Mis-focus is the canonical failure: Eragon's non-verbal caster holding "burn that door" burns whatever the mind drifts to — the render follows the held structure, not the wish.
3. MUST compute the experienced effect from execution evidence. JESL: verdicts FROM journal rows (workflow/jesl-run.ts:46-64), never from the doc's claims.

### 1B — THE PRICING LAW (every system has a cost function)
1. ALWAYS price a cast with an explicit function over the spell's parameters. Three canonical cost models: TES — `cost = B × M^1.28 × D × A` (+skill/perk/equipment multipliers, §2.1); Eragon — `cost = mundane effort of the task` (exact energy equivalence); Witcher — elemental draw + essence burn (fire empowers and marks the caster).
2. NEVER release without a capacity check. TES: pool < cost = fizzle, no cast. Eragon: overrun = death, limit = blackout — which forces the cancellable-process formulation. JESL: cap pre-flight aborts with CAP-UNBOUND and zero rows (executor.ts:159-178).
3. MUST declare the energy source at authoring: pool, external draw, or delegation — each with its own failure surface. JESL: the driver binding IS the source declaration (§5.3).

### 1C — THE INTERFACE LAW (a compiler sits between intent and world)
1. ALWAYS compile intent through an explicit structure: an altar composition (Oblivion), a formula (Witcher), a sentence in a binding language (Eragon), a gesture (Signs). The interface is the safety layer — Eragon's canon history is that unstructured thought-casting caused a near-catastrophe and the fix was binding language to magic.
2. NEVER bypass the interface in production. The interface enforces: total semantics (in Eragon's language, spoken words are true — no lying to the compiler), known-vocabulary-only (Oblivion altars list only effects you know and can cast), and deterministic grammar.
3. MUST keep the interface total and frozen: JESL's `$schema: trident-workflow-v1` + the 8 frozen `[JESL ...]` tokens ARE the interface — inventing vocabulary outside it is the recurring failure class.

### 1D — THE PRIMITIVE-COMPOSITION LAW (the shared physics)
1. ALWAYS decompose spells into parameterized primitives: `{effect-type, magnitude, duration, area, targeting}`. TES effects, Witcher formulae, and Eragon's verb-target sentences all instantiate this exact shape.
2. NEVER treat a named spell as atomic. Every named spell (Fireball, Alzur's Thunder) is a saved composition of primitives + parameters — the name is a pointer to a pipeline.
3. MUST support composition: multi-primitive spells with ordering semantics (§3.3) — the composition surface (Oblivion's altar) is where power actually lives.

### 1E — THE PROCESS LAW (cancellable execution)
1. ALWAYS formulate spells as cancellable processes with checkpoints, not one-shot irrevocable effects. Eragon: released energy is unrecoverable, so a blocked binary spell kills its caster; processes that can stop mid-flight are the master's formulation.
2. NEVER authorize an irrevocable release without a pre-flight and a stop boundary. JESL: the durable ask (suspend/answer/resume) and the gate-bracket (gate → generation → gate, repair ≤ 2) are the checkpoint mechanics.
3. MUST journal mid-process so a stopped spell leaves evidence, not wreckage.

### 1F — THE STACKING LAW (interaction rules are explicit)
1. ALWAYS define how casts interact: same-identity replaces, distinct-identity stacks; amplifiers multiply subsequent effects but not same-cast effects; amplification of amplifiers compounds exponentially.
2. NEVER assume recasting accumulates. Oblivion's measured ladder (§2.1) shows 1→4→16→49→144→400→1089 damage multipliers across an alternating prepare sequence.
3. MUST make interaction rules part of the spell's contract, not the runtime's mood.

### 1G — THE MASTERY LAW (composition beats repertoire)
1. ALWAYS measure power by what the caster can COMPOSE, not what they can EQUIP: bought spells are standardized and weaker than theory-understood casts (TES); vocabulary size is the novice's misconception — inventiveness is the real bound (Eragon); Signs are the everyone-tier, formulae the trained-tier (Witcher).
2. NEVER ship a system where the only path to power is acquiring canned assets.

---

## PART 2 — THE SHARED PHYSICS (the universal spell model, pattern by pattern)

### 2.1 PATTERN: THE EFFECT PRIMITIVE (all systems, one shape)

| System | The primitive | Parameters | Composition surface |
|---|---|---|---|
| Oblivion altar | magic effect | range (self/touch/target), area, magnitude, duration | the altar: add effects one by one, name, save |
| Skyrim | magic effect (fixed combos) | base cost, magnitude, duration, dual-cast flag | none removed in Skyrim — fixed spell tomes |
| Witcher | formula / sign | gesture or ritual; power draw from element plane | witchers: 5 canned Signs; mages: authored formulae |
| Eragon | verb phrase | the word(s), the held mental target, energy budget | the sentence in the binding language; process-formulation |

THE PATTERN: a spell is never a thing — it is a parameterized function. The primitive shape `{type, magnitude, duration, area, targeting}` appears identically in all four. Magnitude^1.28 (Oblivion) is superlinear pricing on power; duration is priced linearly (making sustained effects cheaper per point than bursts — an explicit design incentive); area is priced at 0.15/point; targeted range costs ×1.5 (risk premium).

### 2.2 PATTERN: THE COST FUNCTION (three pricing models, one law)

| Model | Formula | Capacity check | Overrun outcome |
|---|---|---|---|
| TES pool | `Σ B·M^1.28·D·A ×(1.4−0.012·skill)` ×1.5 targeted | pool ≥ cost else fizzle | none (fail-safe) |
| Eragon equivalence | `cost = energy of doing it mundanely` | strength ≥ cost | overrun = death; at-limit = blackout |
| Witcher essence | elemental draw; fire = strongest + self-marking | talent/control (Sources flare untrained) | essence burn; caster takes on the element's vulnerability |

Shared law: cost is a FUNCTION OF THE SPELL'S SHAPE (bigger/longer/wider = more), capacity is a CAST Property, and the capacity check runs BEFORE release. Oblivion adds skill-tier gating by total cost (<26 none / ≥26 skill 25 / ≥63 skill 50 / ≥150 skill 75 / ≥400 skill 100) — power gating by demonstrated competence, not just reserves.

### 2.3 PATTERN: TARGETING & GEOMETRY (the universal range ladder)

Every system grades targeting by risk/energy: SELF (cheapest, safe) → TOUCH (fast animation, low cost) → TARGET (projectile, ×1.5 cost, can miss) → AREA (most expensive, hits all in radius). Oblivion prices it explicitly (×1.5 targeted); Skyrim instantiates it as self-cast / touch / projectile / spray / ward / rune / master-area forms; Witcher Signs are self-centered gestures (Aard push, Quen shield) while mages hurl targeted formulae; Eragon requires the held image of the target (mental targeting — mis-focus = mis-render).

### 2.4 PATTERN: EXECUTION CLASSES (how effects run over time)

| Class | Mechanics | Examples |
|---|---|---|
| INSTANT | fire-and-forget; state change on hit | Oblivion burst heals; Eragon "Brisingr!" ignitions |
| PROJECTILE | spawn → travel → impact-resolution | Skyrim Fireball/Firebolt; witcher bolts |
| SUSTAINED | concentration-held; drains per-second; ends on break | Skyrim Flames/Sparks; Igni spray |
| TIMED | apply state for N seconds, then expire (optionally tapered) | Oblivion Weakness 5s; Skyrim cloak spells |
| TAPERED | magnitude decays by curve after expiry: `M·W·(1−t/TD)^TC`; negative curve = growth | Skyrim lingering effects |
| PERSISTENT/ZONE | world-placed glyph/ward until triggered or expired | Skyrim runes; Yrden |
| SUMMONED | spawn an autonomous entity for a duration | TES atronachs; witcher contracts' summonings |
| PROCESS | multi-step, cancellable, state carried between steps | Eragon's formulated processes (the master tier) |

THE PATTERN: time is a first-class spell axis. Duration is priced, taper curves are defined (`magnitude(t) = M·W·(1−t/TD)^TC`, total ≈ `M·W·TD/(TC+1)`), and the PROCESS class — multi-step with carried state and cancellation points — is the advanced tier every system gates behind mastery.

### 2.5 PATTERN: RESOLUTION (how the world computes the hit)

1. Resistance/absorption stack with caps (TES magic resistance caps at 85%; absorption can negate + refund cost).
2. Ordering rules bind the resolver: amplifiers must precede what they amplify; same-cast amplification is ignored (Oblivion Weakness does not boost Damage in the same cast); trap-effects must precede and outlast kill-effects.
3. Dual-channel tradeoff: Skyrim dual-cast = 2.2× effect for 2.8× cost (2× base for two hands) — a net loss for most schools, a win where level-caps matter (Illusion) or stagger matters (Destruction's Impact).
4. JESL resolution: the Effect "hits" when its nodes' verdicts are computed FROM journal rows; the resolve step is the journal write itself.

### 2.6 PATTERN: INTERACTION & STACKING (the amplification algebra)

Oblivion's measured stacking ladder (prepare = Weakness-to-Fire 100% + Weakness-to-Magic 100%, alternating names; fatality = Fire Damage 10×10s):

| Sequence | total WtM | damage multiplier | total damage |
|---|---|---|---|
| Fatality alone | 0 | 1 | 100 |
| P1, Fatality | 100 | 4 | 400 |
| P1, P2, Fatality | 300 | 16 | 1,600 |
| P1 P2 P1, Fatality | 600 | 49 | 4,900 |
| +P2 | 1,100 | 144 | 14,400 |
| +P1 | 1,900 | 400 | 40,000 |
| +P2 | 3,200 | 1,089 | 108,900 |

Laws: amplification is MULTIPLICATIVE and applies to everything after the amplifier (including other amplifiers) → exponential ladders; same-named casts replace (hence alternating names); magicka-refund loops (Fortify Magicka > spell cost, recast inside the window) exist inside the DSL. JESL equivalent: distinct runIds stack (covers(docHash, seed) replays only the identical cast — new seed = new chain).

### 2.7 PATTERN: THE INTERFACE-COMPILER (the language layer — Eragon as the Effect-Scripting reference)

Eragon's Ancient Language is the only canon system that EXPLICITY designs the compiler; extracted as language design (this is the Effect-Scripting reference):

| Language feature | Mechanic | JESL/programming analogue |
|---|---|---|
| bound vocabulary | each act of magic is linked to a specific word | the node-kind registry (37 kinds, append-only) |
| total semantics | spoken words are TRUE — the compiler forbids lying | the frozen 8-token refusal vocabulary; verdicts from evidence only |
| true names | knowing a thing's name binds it | identifiers/capability tags — `jesl/Shell`, `jesl/Llm`; capability = the name |
| meta-name | knowing the language's own name redefines its words | the schema/meta layer ($schema, meta.tier) — the level that changes the rules |
| grammar | fixed word order; deterministic affixes shift meaning (äf- steal, eld- agent); no participles | the doc schema: nodes/edges/vars are positional; config shapes are closed |
| non-verbal mode | masters may cast without words — BUT a wandering thought redirects the effect | driver-edge vs in-core execution: bypass the edge and the run is uncontrolled |
| process formulation | spells as cancellable multi-step processes | the durable ask; journal checkpointing; gate-bracketed generation |
| energy equivalence | cost = the mundane effort | budget model: deadlineMs, maxNodesFiring 15, cap pre-flight |
| delegation | spirits execute the will; stronger spirits possess the caster | Subagent dispatch behind oracle gates + repair ≤ 2 + 3-strike FAIL |

THE PATTERN: the language is not decoration — it is (a) the type system that makes intent unambiguous, (b) the total-semantics layer that makes execution predictable, (c) the authority model (names = power). Any Effect-Scripting schema needs exactly these four: bounded vocabulary, total semantics, identity/binding, and a meta-layer.

### 2.8 PATTERN: THE MASTERY LADDER (canned → composed → meta)

All systems grade the caster by pipeline control, not asset count:
- **TIER 0 canned:** cast what exists (Skyrim tomes; witcher Signs; bought TES spells). Fast, safe, weak ceiling.
- **TIER 1 composed:** build new from known primitives (Oblivion altar; mage formulae). The power tier — composition surface + cost mastery (duration-shaping, tri-type splitting, amplifier laddering).
- **TIER 2 meta:** control the compiler itself (Eragon: wordless casting, the meta-name; TES: enchanting that zeroes costs; Witcher: Sources channeling raw Chaos). Full power, full danger — the tier where overrun kills and stray thoughts redirect.

---

## PART 3 — THE UNIVERSAL PIPELINE (the 9-stage macro process)

| Stage | Name | Mechanic (shared) | JESL compile |
|---|---|---|---|
| 1 | INTENT | desired world-state forms | meta{name,tier} + vars seed |
| 2 | ACQUISITION | effect vocabulary gained (buy/train/learn) | registry kinds; known-only at the altar |
| 3 | STRUCTURING | intent compiled to a castable form | the doc: nodes+edges+configs |
| 4 | PRICING | cost = f(shape); capacity check | cap pre-flight + budget |
| 5 | PRE-FLIGHT | reserves/discipline validated | decodeDoc → validateDoc → the 5 refusals (before any fiber) |
| 6 | RELEASE | the pipeline executes | runProgram: readiness batches, forEach(15) |
| 7 | RENDER | world-state change manifests | node outputs → channels → downstream wake |
| 8 | SETTLEMENT | costs/residues land | budget consumed; journal rows written |
| 9 | RECORD | experienced effect knowable | verdicts FROM journal rows; bus events; replay via covers() |

THE PATTERN: blur stage 3 (unstructured intent) = the stray-thought catastrophe; skip 4/5 = the overrun death; skip 9 = you cannot distinguish a cast spell from a claimed one. Every canonical failure mode is a skipped stage.

### 3.5 THE WORKED REFERENCE — FIREBALL THROUGH EVERY SYSTEM (the mechanics only)

**The 9 stages for the fireball:**

| Stage | TES (Skyrim Fireball, Destruction/Adept) | Oblivion altar-authored | Witcher (Igni-tier vs formula) | Eragon process-spell |
|---|---|---|---|---|
| 1 INTENT | explosion at target | Fire Damage Npts × Ds, Targeted, Area A | gout of flame | "that target, engulfed" |
| 2 ACQUISITION | tome (Adept = skill 50) | must KNOW a Fire Damage spell to compose with it | Signs = witcher training; formulae = mage academies | learn `brisingr`/`istalri` + binding grammar |
| 3 STRUCTURING | fixed: projectile + impact AoE | altar: effect×params, named, saved | gesture (canned) vs formula (authored) | sentence + held image; process formulation |
| 4 PRICING | base×mults (skill 1−(s/400)^0.65) | `B(0.75)·M^1.28·D·A×1.5×skillmult` | elemental draw (Fire = strongest, self-marking) | exact mundane burn-effort |
| 5 PRE-FLIGHT | magicka ≥ cost else fizzle | cost tier gates skill (≥26→25 ...) | control vs Chaos | strength ≥ cost else death → cancellable check |
| 6 RELEASE | charge-release projectile | cast: animation per range | gesture burst / formula rite | will drives energy through the held image |
| 7 RENDER | impact blast + burn | per-effect ordered resolution | cone/burst render | the HELD target burns (mis-focus = wrong victim) |
| 8 SETTLE | magicka drained; Destruction XP | magicka + gold (creation = 3× cast) | essence residue | energy unrecoverable; blackout risk |
| 9 RECORD | implicit (felt/logged) | implicit | bestiary notes | the scar; the caster knows |

**The same fireball as a JESL Effect Spell (the compiled form):**

```json
{ "$schema": "trident-workflow-v1",
  "meta": { "name": "fireball-spell", "tier": 1, "seed": { "channel": "target" } },
  "nodes": [
    { "id": "target-lock",  "type": "gate",
      "config": { "asserts": [{ "path": "$.target.zone", "op": "contains", "value": "hostile" }] } },
    { "id": "price",        "type": "math-eval",
      "config": { "expr": { "_tag": "mul",
        "left":  { "_tag": "literal", "value": 0.75 },
        "right": { "_tag": "var", "name": "power" } } } },
    { "id": "release",      "type": "shell-exec",
      "config": { "cmd": "render_fireball --at ${target.zone} --power ${power}", "timeoutMs": 5000 } },
    { "id": "resolve",      "type": "gate",
      "config": { "asserts": [{ "path": "$.release.exitCode", "op": "eq", "value": 0 }] } },
    { "id": "record",       "type": "triplet-writer",
      "config": { "triplet": { "pattern": "spell.fireball", "state": "CAST",
                               "anchor": "fireball:release:exitCode=0" } } }
  ],
  "edges": [
    { "from": "target-lock", "to": "price",   "via": "target" },
    { "from": "price",       "to": "release", "via": "power" },
    { "from": "release",     "to": "resolve", "via": "release" },
    { "from": "resolve",     "to": "record",  "via": "data" }
  ],
  "vars": { "target": "zone-A", "power": 10 }
}
```

Read the compile: stage 1-3 = meta+nodes (the IDEA bound as name/seed, the EFFECT as the ordered pipeline); stage 4 = the `price` math-eval node (the cost function IS a node); stage 5 = `target-lock` + `resolve` gates (the pre-flight brackets); stage 6 = `release` (the cap-bound shell-exec — the Effect fires); stage 7 = outputs flowing `via` channels (the render wakes downstream); stage 8 = budget consumed; stage 9 = `record` triplet + the journal chain (the EXPERIENCED EFFECT, replayable via covers at zero cost).


## PART 4 — CORRECT / WRONG PAIRS

### P4-1 — UNSTRUCTURED INTENT
- **WRONG:** cast from raw intention, no compiled structure → the render follows whatever the executor holds mid-flight (the mis-focus failure).
- **CORRECT:** compile to the doc first (decodeDoc → validateDoc → the 5 refusals) — the interface is the safety layer.
- **FIX:** author the workflow.json; never run outside the schema.

### P4-2 — THE IRREVOCABLE ONE-SHOT
- **WRONG:** a binary succeed-or-perish spell — a blocked stronger adversary kills the caster.
- **CORRECT:** the cancellable process: checkpoints, durable ask, gate-bracket with repair ≤ 2.
- **FIX:** re-author with stop boundaries; assert cancellation safety in fixtures.

### P4-3 — UNPRICED EFFECT
- **WRONG:** an effect with no declared cost or source.
- **CORRECT:** cost = f(shape) declared at authoring; capacity checked pre-flight (CAP-UNBOUND with zero rows).
- **FIX:** bind the driver or drop the node.

### P4-4 — REPERTOIRE-AS-POWER
- **WRONG:** buying every canned spell and calling it mastery.
- **CORRECT:** the composition tier is where power lives (altar/formula/sentence); run the lifecycle kernels to author, not acquire.
- **FIX:** author the next spell through P3-1..P3-5.

### P4-5 — SAME-NAME STACKING
- **WRONG:** recasting an identical cast expecting accumulation.
- **CORRECT:** same identity replaces; distinct identities stack; reseed for a fresh chain.
- **FIX:** new runId/seed; verify chains-identical, never assume.

### P4-6 — ORDER-BLIND COMPOSITION
- **WRONG:** arbitrary effect order in one cast (amplifier after its target; trap after kill).
- **CORRECT:** order = the dataflow graph; amplifier-first, trap-outlasts-kill.
- **FIX:** re-derive order from channels; assert with the diamond fixture.

### P4-7 — THE NARRATED RENDER
- **WRONG:** "it worked because I said the words."
- **CORRECT:** the experienced effect is computed from execution evidence (journal rows, bus events, passTokens IN tool output).
- **FIX:** run, read rows, then claim.

### P4-8 — UNBOUND DELEGATION
- **WRONG:** delegating execution to an unbound stronger agent.
- **CORRECT:** delegate behind an oracle gate + repair bound + 3-strike failure + authority chain.
- **FIX:** gate before delegate; journal causation; test the strike path.

### P4-9 — THE META-TIER WITHOUT DISCIPLINE
- **WRONG:** stepping to the meta tier (wordless casting / raw-Chaos channeling / schema-bypassing) without the discipline the tier demands. Canon: Sources flare untrained; non-verbal drifts mid-cast.
- **CORRECT:** the meta tier is EARNED through the composed tier: journal discipline, oracle cards, sniff-test habit — then the shorthand becomes safe.
- **FIX:** drop back to composed casting until the evidence habit is mechanical.

### P4-10 — THE ZERO-COST ILLUSION
- **WRONG:** reading an enchanted zero-cost build as "the spell is free" — the cost was paid at enchant time (soul magnitude bounds the charge; the gear holds it).
- **CORRECT:** cost is conserved and relocated, never deleted: JESL budgets live on the run; a fast driver just moves where the price lands.
- **FIX:** account the cost where it is paid; assert the budget in fixtures.

**BYPASS CLOSURE:** every anti-pattern above has a schema-level tripwire — the 5 refusals catch P4-1/P4-3 at decode; the tier gate catches P4-2's unbracketed generation; the journal + covers catches P4-5/P4-7 (an unnarrated run cannot produce a verified replay); the dataflow readiness catches P4-6 at graph build; the oracle cards + strike path catch P4-8; the pre-flight budget catches P4-10. No pattern is caught by prose — all are caught by mechanics.


## PART 5 — THE EFFECT SPELLCASTING SCHEMA (compiled onto JESL + TDM)

### 5.1 THE TRIAD MAPPING

```
 CANON STAGE        TDM (v4.4.3)                     JESL COMPILE
 IDEA (1-3)    ──►  L0 ProblemSpaceAssessment   ──►  meta + vars + the authored node set
                    L1 invariant/pathPhases/options
 EFFECT (4-6)  ──►  L2 DecisionContext:         ──►  cap pre-flight (pricing) → readiness
                    consequence cascade 1/2/3,       batches (release) → per-node invoke;
                    reversibility window,            journal invoke+verdict rows
                    recommendation (confidence)
 EXPERIENCED   ──►  L3 trap detection (=        ──►  verdict FROM journal rows + bus events
 EFFECT (7-9)       mis-focus detection) +           (trace.timeline) + RunSummary +
                    L4 Completion Intelligence       covers() replay (the reusable record)
```

TDM constants as spell constants: DECISION_TIME_REVERSIBLE 120s (the canned tier — decide now) vs MIN_DELIBERATION_IRREVERSIBLE 60s (the meta tier — oaths bind); CONSEQUENCE_CASCADE_DEPTH 3 (3rd-order foresight before an irreversible cast — the amplification ladder read forward); OPTION_EXHAUSTION_MINIMUM 3 (never a binary spell); SNIFF_TEST_CONFIDENCE 0.85 (the render-verification bar); FRAMEWORK_COMPOSITION_MAX 5 (working memory per decision).

### 5.2 THE FIVE-STAGE PIPELINE (the operator's 5 steps)

**STAGE 1 — WRITE THE SPELL (idea → effect → experienced as one document).** Author the JESL workflow.json: meta+vars bind the IDEA; nodes+edges bind the EFFECT (composed from registry primitives — the altar surface); the journal/verdict contract binds the EXPERIENCED EFFECT (what will count as evidence). Deterministic kinds are the vocabulary; bracketed generation is the inventive composition; edges are the grammar.

**STAGE 2 — CONVERT THE SPELL TO TDM FRAMEWORKS.** L0: classify (type/complexity/tier). L1: the invariant (what must hold: "damage accrues at the target zone"), pathPhases (structure→price→release→render), option space ≥3. L2 per phase: ≤5 frameworks — PREMORTEM (what blocks the cast?), CONSEQUENCE_CASCADE (2nd-order residue, 3rd-order spread), BLAST_RADIUS (what else is in range), ASSUMPTION_AUDIT (oracle cards), SNIFF_TEST 0.85 (render-check before declaring castable). L3 velocity: tier-1 → decide now; tier-2 → deliberate.

**STAGE 3 — CONVERT THE TDM FRAMEWORKS TO JESL SCRIPTS.** Each framework compiles to structure: CONSEQUENCE_CASCADE → the edge graph (each `via` channel = a consequence flowing forward); ASSUMPTION_AUDIT → oracle-gate rule cards (expected values mandatory — mpse/rule-cards.ts:27-71); REVERSIBILITY → pause node + journal checkpoints; PREMORTEM → fallback-chain + the bad-fixture set; SNIFF_TEST → the verify kernel's passToken-in-tool-output check; BLAST_RADIUS → evidence machine + audit scanner.

**STAGE 4 — THE JESL KERNEL (the real-time Experienced-Effect renderer).** Package the script as `jesl/kernels/<spell>/` (activities.ts + workflow.json + SKILL.md + fixtures/). runProgram executes the Effect in real time; the journal records the Experienced Effect as evidence while it happens; bus streams the render; covers() makes the experience replayable at zero cost. The kernel is the injection point where a scripted spell becomes a living render in a runtime space.

**STAGE 5 — THE SKILL ROCKET (the self-contained castable spell).** `emitSkill(doc, outDir, writer)` (packager/skill.ts:53-78) emits: SKILL.md (the fuse + launch line `jesl run payload/workflow.json --in payload/ctx.json`), payload/workflow.json (the byte-preserved spell), ctx.json (vars/seed), mission.md (objective), anti-patterns.json (misfire table). A named, owned, packaged formula — castable by anyone with the kernel, journaled, replayable.

### 5.3 ENERGY SOURCES = DRIVER BINDINGS

| Canon model | JESL binding | Price |
|---|---|---|
| resource pool (TES magicka) | budget: deadlineMs 600s, maxNodesFiring 15 | exhaustion = deadline hit |
| exact-effort equivalence (Eragon) | cap pre-flight: unbound = refusal, zero rows | overrun = loud CAP-UNBOUND |
| elemental essence (Witcher) | the driver's own failure surface (CliLive real I/O vs TestLive memory) | the bound environment shapes the run |
| delegation (spirits) | Subagent behind oracle gate + 3-strike | possession = the strike path |
| the binding language itself | `$schema: trident-workflow-v1` — nothing runs outside it | the 8 frozen refusals |

### 5.4 THE FULL TDM → JESL FRAMEWORK MAP (all 20, the compile table)

| TDM framework | Spell-domain reading | JESL compile (nodes / fixtures) |
|---|---|---|
| F1 FIRST_PRINCIPLES | decompose the spell to its irreducible primitives | the primitive set `{type,M,D,A,target}`; math-eval nodes for the cost terms |
| F2 REVERSIBILITY | is the cast one-way? (Eragon's law) | pause node / durable ask; the cancellable-process gate bracket |
| F3 CONSEQUENCE_CASCADE | 1st/2nd/3rd-order world effects | the edge graph depth; each `via` channel = one order |
| F4 OPTION_EXHAUSTION | ≥3 cast formulations before choosing | ≥3 candidate docs; fixtures per candidate |
| F5 ASSUMPTION_AUDIT | every rule card carries its expected value | oracle-gate + mpse rule-cards (expected mandatory) |
| F6 CRITICAL_PATH | the minimal node chain for the Effect | the readiness-batch order (graph.ts) |
| F7 ELIMINATION | fewest nodes that satisfy (lowest tier wins) | tier-1 deterministic kinds before any generation |
| F8 MINIMUM_VIABLE_PATH | the shortest castable doc | the diamond fixture (2 batches) |
| F9 PARALLEL_TRACKS | independent sub-effects run concurrently | parallel node / ready-set overlap (c=15) |
| F10 MENTAL_SIMULATION | the held-image render check | TestLive dry-run (spec-to-kernels) before real cast |
| F11 INFLECTION_DETECTION | stall = the approach is invalidated | the run loop's ready=∅ break; kernel retry budget |
| F12 BLAST_RADIUS | what else the Effect touches | evidence machine + audit scanner scope |
| F13 PREMORTEM | the misfire table before casting | fallback-chain + anti-patterns.json in the rocket |
| F14 COGNITIVE_MODEL | which thinking mode this spell needs | thinkingMode in DecisionContext → tier choice |
| F15 DEPTH_CALIBRATION | how deep to analyze before casting | CONSEQUENCE_CASCADE_DEPTH 3 |
| F16 DECISION_VELOCITY | canned tier: cast now; meta tier: deliberate | 120s reversible cap / 60s irreversible floor |
| F17 DERIVATION_ENGINE | derive new spells from working ones | the lifecycle: spec-to-kernels from a proven spell |
| F18 ENHANCEMENT_PROTOCOL | the 10x version (the stacking ladder) | the amplification algebra (§2.6) as authored prepares |
| F19 CONVERGENCE_DETECTOR | the run settles at its attractor | the executor loop termination (completed = ∁ nodes) |
| F20 SNIFF_TEST | would an adversarial reviewer accept the cast? | passToken IN tool output (verify kernel); 0.85 confidence |


## PART 6 — PROCEDURES

### P3-1 — AUTHOR A SPELL (Stages 1-3)
```
1. Write spell.json per the schema: $schema trident-workflow-v1 · meta{name,tier}
   · nodes[{id,type,config}] · edges[{from,to,via}] · vars
2. Compose from registry kinds only (37 known — the altar law)
3. Order by the dataflow: a node fires when its inbound channels are written
4. Price it: deterministic tier-1 = no caps; cap-bound = declare the driver;
   generation = bracket{contract, repair≤2, confidenceFloor}
5. Gate: cd jesl && bunx tsc --noEmit && npx vitest run (runner is vitest, never bun test)
6. Dry-cast: bun run cli/main.ts validate spell.json   # the 5 refusals or "ok"
```

### P3-2 — CAST (Stage 4-6)
```
bun run cli/main.ts run spell.json [--in vars.json] [--driver cli|test]
  → stdout: {"verdict": "PASS"|"FAIL"|"INCONCLUSIVE", results, batches, rows}
  → exit 0 pass · 1 fail/inconclusive · 2 refusal
refusal surface (stderr, the 8 frozen tokens):
  [JESL UNKNOWN-NODE] [JESL CYCLE] [JESL TIER-VIOLATION]
  [JESL UNBRACKETED-GENERATION] [JESL CAP-UNBOUND]
  [JESL ORACLE-MISSING] [JESL CHANNEL-UNSET] [JESL NO-SEED]
```

### P3-3 — READ THE EXPERIENCED EFFECT (Stages 7-9)
```
bun run cli/main.ts run spell.json > run.json
bun run cli/main.ts replay run.json     # → {"verified": true} + exit 0
the rows ARE the experienced effect: per node, invoke+verdict, sha256-chained
```

### P3-4 — TDM CONVERSION (the mental pass between 1 and the kernel)
```
L0: classify the spell (type/complexity/tier)
L1: invariant + pathPhases (structure→price→release→render) + ≥3 options
L2: ≤5 frameworks for the phase; cascade depth 3; sniff 0.85
L3: velocity — tier-1 decide now; tier-2 deliberate
compile each chosen framework into nodes/edges/fixtures (see §5.2 Stage 3 table)
```

### P3-5 — PACKAGE THE ROCKET
```
import { emitSkill } from "./packager/skill"
yield* emitSkill(doc, ".opencode/skills/", writer)
→ <name>/SKILL.md + payload/{workflow.json, ctx.json, mission.md, anti-patterns.json}
launch: jesl run payload/workflow.json --in payload/ctx.json
```


## PART 7 — TROUBLESHOOTING MATRIX

| SYMPTOM | CAUSE (mechanic) | FIX |
|---|---|---|
| `[JESL UNKNOWN-NODE] field=type` | kind not in registry | fix the kind or append (append-only) |
| `[JESL CYCLE]` | edge graph cyclic | break the cycle (gate/event-reactivate) |
| `[JESL TIER-VIOLATION]` | tier-1 doc uses generation | raise meta.tier or replace the node |
| `[JESL UNBRACKETED-GENERATION]` | tier-2 generation without bracket | declare bracket{contract,repair≤2,floor} |
| `[JESL CAP-UNBOUND] <cap>` | driver lacks the bound | bind the Layer or drop the node |
| `[JESL CHANNEL-UNSET]` | read of an unwritten channel | seed it (--in) or fix edge.via |
| `[JESL NO-SEED]` | declared entry channel unseeded | seed vars or fix meta.seed |
| `[JESL ORACLE-MISSING]` | rule card without expected | provide the oracle value |
| replay `"verified": false` | chain tampered/foreign writer | re-run; never hand-edit rows |
| INCONCLUSIVE verdict | stub fired / confidence < floor / incomplete triplet | read evidence.anchor for which |
| run hangs on pause | Deferred awaits resume | pauseResume(key,value) or inbound signal |
| battery prints HANG | fixture exceeded the 2s race | the row is HANG — malformed fixture |
| vitest fails under `bun test` | bun:test ≠ vitest (`onTestFinished`) | `npx vitest run` — the canon runner |
| test hangs at 5000ms | TestClock never advances sleep | real-timer pattern in tests |
| RegistryFrozenError on register | divergent re-register of existing kind | append-only: same family+caps only |
| editor shows test-file errors | @ts-nocheck class + per-dir include | editor noise — the gate is tsc |
| LSP gate denies a .ts write | error-severity diagnostics | fix floatingEffect/runEffectInsideEffect |
| ORACLE_CONFLICT | duplicate oracleKey registration | dedupe the cards (first wins) |
| DEPTH_EXCEEDED in parser | MathExpr nesting > 256 | flatten the expression |
| FLOAT_EPSILON_MISSING | float oracle without tolerance | provide positive-finite tolerance |
| EXCLUDED not FAIL on a sample | D17 born-off exclusion | correct behavior — counted under excluded |
| dual-cast feels weaker | 2.2× effect for 2.8× cost | school-dependent; zero-cost builds aside |
| same spell recast "didn't stack" | same identity replaces | distinct names/ids stack |
| amplifier didn't boost same cast | same-cast amplification ignored | amplifier must precede (separate casts) |

## PART 8 — QUICK REFERENCE

### 8A — the universal spell shape
```json
{ "primitive": { "type": "fire-damage", "magnitude": 10, "duration": 6,
                 "area": 0, "targeting": "touch" },
  "cost": "B(0.75) × 10^1.28 × 6 × 1 × skill-mult",
  "executionClass": "TIMED",
  "stacking": "distinct-identity only",
  "order": "amplifiers before targets; traps before kills" }
```

### 8B — the triad contract (a JESL spell binds all three)
```json
{ "$schema": "trident-workflow-v1",
  "meta": { "name": "spell-name", "tier": 1 },
  "idea":     "meta + vars — the structured intent",
  "effect":   "nodes[] + edges[] — the priced pipeline",
  "experienced": "journal rows + verdicts FROM rows + bus events" }
```

### 8C — the shared-physics table
| Axis | Values (shared across canon) | JESL compile |
|---|---|---|
| targeting | self → touch → target → area | range in configs; edges as dataflow |
| execution | instant / projectile / sustained / timed / tapered / zone / summoned / process | node kinds + budget + durable ask |
| pricing | f(shape) with capacity pre-check | budget + cap pre-flight |
| resolution | resistance caps · ordering rules · tradeoff multipliers | Exit capture → verdict map |
| interaction | same-replaces / distinct-stacks / amplifiers-multiply | runIds + covers() + reruns |
| mastery | canned → composed → meta | tier-1 kinds → authored docs → lifecycle kernels |

### 8D — doctrine (verbatim)
- "Casting a spell with magic costs as much energy as would be lost to do the task by mundane means." — Inheriwiki: Magic
- "formulat[e] spells as processes which could be cancelled at will" — Inheriwiki: Magic
- "a badly put-together spell likely won't work at all, but alchemy gone wrong can be poison" — UESP Lore:Magic
- "The Power bound in spell formulae" — Witcher Wiki glossary
- "The order of different effects can be very important to the custom spells" — UESP Oblivion:Spell Making
- "verdicts FROM journal rows, never prose" — the JESL canon line

### 8E — real paths
```
JESL kernel      .../Effect_Runtime_Kernels/jesl/           (109 files; runner: npx vitest run)
TDM spec         .../v4.4.3/TRIDENT_DECISION_MAKING_TOOL_SPEC.md  (1,525L)
this bible       .../KNOWLEDGE_LIBRARY/Bibles/JESL/EFFECT_SPELLCASTING_BIBLE.md
boilerplate      .../KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/JESL-Kernel-Edition-v1.0/
```

## PART 9 — ZERO-TRUST VERIFICATION (the bible's own gate)

```
# the kernel the spells run on
cd jesl && bunx tsc --noEmit && echo TSC:0          # expect 0
cd jesl && npx vitest run 2>&1 | grep Tests         # expect 336 passed (34 files)

# the spell host-gate (the happy cast + one refusal + the replay)
bun run cli/main.ts run fixtures/mech-gate.json | head -2     # "verdict": "PASS"
bun run cli/main.ts validate fixtures/bad-unknown-kind.json 2>&1 | grep -o 'JESL [A-Z-]*'
bun run cli/main.ts run fixtures/mech-gate.json > /tmp/j.json && bun run cli/main.ts replay /tmp/j.json | grep verified

# the doc's own floor
wc -l KNOWLEDGE_LIBRARY/Bibles/JESL/EFFECT_SPELLCASTING_BIBLE.md   # ≥ 300 (discipline bible)
```

Fresh-agent check: could you author, cast, verify, and rocket a spell from Parts 1-6 alone, with no other context? If any step is unclear, the gap is in this bible — fix the bible, not the reader.

## PART 10 — SELF-AUDIT FINDINGS (the zero-trust pass on this bible)

| Sev | Finding | Disposition |
|---|---|---|
| LOW | TDM framework prompts (the spec's §framework-library detail) are summarized, not quoted — the spec at v4.4.3 is the authority for prompt text | pointer in §8E; spec is READ-ONLY authority |
| LOW | Witcher game-level spell stats (per-sign stamina costs) not tabulated — the wiki source covers lore-tier mechanics; game wikis would add per-title tuning | the shared-physics table (§2) is the deliverable; per-title tuning is out of scope |
| INFO | Eragon section is deliberately language-design only (per operator ruling) — no plot/world content | enforced: §2.7 |
| INFO | the canon sources are web wikis (fetchable, re-fetchable) — anchors are by URL name, not line | listed in the header block |

PASS: the bible meets the discipline floor, every rule carries a mechanism, every pair carries a fix, every troubleshooting row carries a cause, the procedures are copy-pasteable, and a fresh agent can operate from this alone.


## VERSION HISTORY
| v | date | change |
|---|---|---|
| 1.0 | 2026-09-03 | first authoring (lore-heavy) |
| 2.0 | 2026-09-03 | operator correction: lore stripped entirely; rewritten as SHARED-PHYSICS mechanics only — the universal spell model (§2.1-2.8: primitives, pricing, targeting, execution classes, resolution, stacking algebra, the interface-compiler, the mastery ladder) + the 9-stage universal pipeline (§3) + the JESL/TDM compile (§5); Eragon retained solely as the Effect-Scripting language reference (§2.7) |
