# Custom-Formulation Herbal Apothecary

**Author:** Rohan Jasani

---

## The files

| File | What it is |
|---|---|
| `DOMAIN.md` | **The business.** Its context, business model, people, workflows, and data model. Shared, and identical wherever it appears. |
| `BRIEF.md` | **What's being built here.** Assignment, scope, persona, requirements, and success criteria for this repo's build. |
| `DESIGN.md` | **How it should look.** Brand color palette, typography, component patterns, spacing, and logo usage rules. |

## How to use them

**Read `DOMAIN.md` first, then the brief.** The domain explains who these people are and how the business works; the brief tells you what to build for one of them.

**`DOMAIN.md` describes the business only.** It never mentions what's being built — which is what lets it stay stable while briefs change, and what makes it safe to reuse unchanged.

**The brief references the domain; the domain never references the brief.** A brief cites sections by number — *"Primary persona: Maya Okonkwo (`DOMAIN.md` §D3)"* — and then covers only what's specific to this build. It doesn't restate personas, workflows, or entities.

**If something is described in two places, `DOMAIN.md` wins.**

**Don't renumber `DOMAIN.md` sections.** They're cited as `§D1`–`§D5`. Renaming a heading is safe; renumbering breaks references.

**`DOMAIN.md` is copied, not forked.** Change it once and propagate — via submodule, symlink, or plain copy. Drift defeats the point of sharing it.
