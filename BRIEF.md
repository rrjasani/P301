# BRIEF — Operational Dashboard

**Author:** Rohan Jasani

> **Read `DOMAIN.md` first.** It describes the business, its people, its workflows, and its data. This brief covers only what's being built, and cites the domain by section (e.g. `DOMAIN.md §D3`).

---

## Assignment

> **P301 — Operational dashboard**
>
> Build a dashboard that gives the right person the right information.
>
> **What you're building?**
>
> A good dashboard doesn't just show data -- it helps someone act without digging through a spreadsheet. Think about who's looking at it and what they need to know right now. What would make their morning easier? What would tell them something's off before it becomes a problem?

---

## Scope decision

**Build one dashboard: Assortment Profitability.** A single, well-argued view for a single person beats three shallow tabs. Two other operational views were considered — supply & replenishment, and practitioner relationships — and are cut.

This also resolves cleanly against the role split in `DOMAIN.md §D3`: replenishment is Devon's job, so building it would have meant serving two users at once. Assortment strategy is unambiguously **Maya's**.

## Experience focus
The **back-of-house strategic view** — the screen the business is steered by. Desktop, sit-down, reviewed monthly or quarterly rather than glanced at daily.

## Primary persona
**Maya Okonkwo, Owner/Operator** — `DOMAIN.md §D3`.
Relevant journey: **J4, Assortment review** — `DOMAIN.md §D4`.

## The question the dashboard answers

> **Is what I carry worth carrying?**

Every jar on the shelf is a bet: capital spent, space occupied, expiry clock running. Some bets pay off, some quietly don't, and in a 300-SKU assortment nobody can tell which is which by looking. Maya needs to see which herbs earn their shelf space — and be handed the decision, not just the data.

---

## Functional requirements

- **R1 — Assortment ledger.** Every SKU (herb × plant part × preparation form) with: on-hand quantity, capital tied up, trailing-window units dispensed, revenue, COGS, margin % and margin $, inventory turns, and date last dispensed.
- **R2 — Velocity × margin positioning.** A quadrant/matrix view placing every SKU on movement against profitability, resolving to four dispositions: **expand / hold / reduce / discontinue.**
- **R3 — Dead stock identification.** SKUs with no movement in the trailing window, with capital tied up and expiry exposure quantified. *"$4,180 sitting in 23 SKUs that haven't moved in six months; $1,900 of it expires within 90 days."*
- **R4 — Practitioner breadth.** How many distinct practitioners order each SKU. A high-revenue herb ordered by exactly one practitioner is a **concentration risk**, not a success — that revenue leaves when the practitioner does.
- **R5 — Pricing opportunity.** Since pricing is apothecary-set (`DOMAIN.md §D2`), surface SKUs priced below assortment-median margin despite steady demand. Margin is a lever Maya can pull without buying anything.
- **R6 — Form comparison.** Where an herb is carried in more than one form (cut & sift root vs. tincture), compare their performance — sometimes the answer is to drop a form, not the herb.
- **R7 — Unmet demand / add candidates.** Herbs requested but not carried (journey **J5**), ranked by request frequency and number of distinct requesting practitioners; plus stockouts that blocked an order. The other half of the assortment decision.
- **R8 — Impact framing.** Show what a recommended action is worth: capital freed, margin gained, revenue at risk. Turns a suggestion into a decision.
- **R9 — Drill-down.** Every headline number resolves to the underlying SKUs, lots, and orders.

## Experience requirements

- **Decision-oriented.** Each panel ends in a recommended action with a number attached, not just a chart.
- **Exception-first.** Healthy, well-performing SKUs should be quiet. The screen leads with what needs changing.
- **Honest about tradeoffs.** Dropping a slow herb may be right financially and wrong clinically — a rarely-used herb may be the only option for a specific presentation. The design should let Maya see *why* an herb is slow before she cuts it, and mark SKUs as protected.
- **Domain-literate.** Latin binomial, plant part, and preparation form treated as first-class throughout.
- **Self-explaining.** Every KPI carries a small info affordance (click to open a short explanation of what it means and how to use it) so the dashboard doesn't require a walkthrough.

## Design system

All visual decisions — color palette, typography, component patterns, spacing, and logo usage — are documented in `DESIGN.md`. The dashboard must be built to that system.

Key constraints for this build:
- Use the brand's gold (`#F2CE00`), leaf-green (`#6E9219`), and bark-brown (`#4E3F28`) as the primary palette.
- Gold is a block color only; never set type in gold. Dark brown or forest text on gold passes AA contrast.
- Rust (`#C9531F`) is reserved for the single primary CTA per view.
- Square or barely-rounded corners throughout; no pills, drop shadows, or heavy radii.
- Body type in Open Sans or Source Sans 3; headings in Museo Sans or Ubuntu.

Refer to `DESIGN.md` for tokens, component specs, and the full do/don't list before designing any panel.

## Sections (as built)

Header KPIs sit above everything and stay visible; sections 2–6 are organized as
**tabs** below the KPIs (not a single scrolling page) so Maya can jump straight to
what she cares about. The SKU drawer is a global overlay reachable from any tab.

1. **Header** — assortment health at a glance: total SKUs, total capital tied up,
   share of capital in non-moving stock, blended margin, turns. Each tile carries
   a small info affordance explaining what the number means and how to use it.
2. **Velocity × margin quadrant** *(tab)* — the centerpiece. Every SKU plotted; a
   Chart/Table toggle gives an accessible alternate view; the table supports
   column sorting and per-column filters (text search, disposition, and min/max
   ranges on turns, margin, and capital), independent of the page-level filter
   row above. Click a point or row to drill in.
3. **Action queue** *(tab)* — grouped recommendations: discontinue · reduce ·
   expand · reprice · dead stock now · add candidates, each with its dollar impact.
4. **Dead stock & expiry exposure** *(tab)* — the money currently evaporating.
5. **Concentration risk** *(tab)* — SKUs dependent on one or two practitioners.
6. **Add candidates** *(tab)* — unmet demand from requests and stockouts.
7. **SKU detail drawer** — full history, form comparison, practitioner mix, lots
   on hand, and the clinical note on why this herb might be worth protecting.
   Opens from any tab.

---

## Success criteria

1. Clearly **role-targeted** — a reviewer can name Maya and her job-to-be-done from the screen alone.
2. Every section resolves to a **decision with a dollar figure**, not just a display.
3. Domain modeling is **credible to someone who knows herbal medicine** — Latin names, plant part and preparation form as first-class, and an acknowledgment that clinical need doesn't always follow sales velocity.
4. A **working prototype**, built with AI-assisted tooling, not a static comp.

## Implementation

Built as a Vue 3 + Vite single-page app (no backend) — see `app/`. Seed data
(254 SKUs across 113 herbs, deterministic) is generated by
`tools/generate-data.mjs` into a static ES module; nothing is fetched at
runtime. Run with `npm install && npm run dev` from `app/`.

## Open decisions

| # | Decision | Status |
|---|---|---|
| 1 | Persona and scope | **Resolved** — Maya, assortment profitability only |
| 2 | Trailing window: fixed 6 months, or user-selectable? | **Resolved** — fixed at 6 months (180 days); not user-selectable in this build |
| 3 | Is "protected SKU" (clinically necessary, commercially poor) a user-set flag or derived? | **Resolved** — derived from clinical note + demand tier; not a user-editable flag in this prototype |
