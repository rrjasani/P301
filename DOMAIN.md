# DOMAIN — Custom-Formulation Herbal Apothecary

A description of the business: what it does, who works in it, how work flows through it, and what data it runs on.

This is the **single source of truth** for the domain. Section numbers (`D1`–`D5`) are stable and should not be renumbered, since other documents cite them.

**Contents:** D1 Domain context · D2 Business model · D3 People · D4 Workflows · D5 Data model

---

## D1. Domain Context

### What a custom-formulation apothecary is
Custom (or "bespoke") formulation is the traditional method of preparing herbal medicine across most world traditions — Chinese, Ayurvedic, Unani, Western. It differs from off-the-shelf supplements in one critical way: **it factors in energetics.**

Energetics — the warming/cooling, drying/moistening, tonifying/dispersing qualities of an herb — allow a formula to be personalized to the individual, their constitution, and their current tendencies rather than to a diagnostic label. Ten clients can share the same biomedical diagnosis and receive ten different formulas: different herbs, different plant parts, different proportions.

The apothecary is the **compounding and fulfillment layer** in this system. It does not diagnose or prescribe. It stocks raw materials, executes formulas specified by practitioners, and hands the finished preparation to the practitioner's client.

### Inventory reality
The apothecary may carry ~300 distinct herbs. Critically, **an "herb" is not one SKU** — the unit of inventory is *herb × plant part × preparation form*, because different parts of the same plant carry different properties and are therefore not substitutable.

Preparation forms:

| Form | Notes |
|---|---|
| Cut & sift — aerial parts | Leaf, flower, stem; for teas/decoctions |
| Cut & sift — roots | Denser, longer decoction times |
| Tinctures | Alcohol-based extractions; long shelf life, measured in mL |

Apothecaries may also carry powders, capsules, oils, salves, glycerites, and granules.

### Inventory characteristics
- **Perishable.** Cut & sift botanicals lose potency; typical shelf life 1–2 years. Roots hold longer than aerial parts. Tinctures hold for years.
- **Lumpy demand.** A single practitioner adopting an herb can spike demand; a practitioner leaving can strand it.
- **Long, seasonal lead times.** Many botanicals are harvest-dependent, single-source, or import-dependent.
- **Capital-intensive to over-hold.** Money sitting in slow-moving herbs that then expire is a double loss — carrying cost plus write-off.
- **Traceable by necessity.** Adverse events must be traceable back to a specific lot and supplier.

---

## D2. Business Model

Three parties, and the money does not flow the way you'd first guess:

1. **Herbalist / practitioner** — sees the client, designs the formula, submits the order to the apothecary. Is the apothecary's *account relationship*, but usually **not the payer**.
2. **Client (the practitioner's patient)** — receives and typically **pays** for the formula at pickup.
3. **Apothecary** — compounds, holds inventory, fulfills, collects payment, manages QC and supplier relationships. **Sets pricing**, and so controls both cost and margin.

The apothecary's *account* is the practitioner — retention, volume, loyalty, referrals. Its *transaction* is with the client.

---

## D3. People

**Scale:** the shop is large enough to warrant a dedicated inventory/purchasing manager. Roles are genuinely split — the owner is not doing the buying herself.

### Maya Okonkwo — Apothecary Owner / Operator
Runs the business. Owns assortment strategy, pricing, margin, practitioner relationships, and growth. Delegates day-to-day buying to Devon and bench work to Sam, but is accountable for whether the shop is profitable and whether the right things are on the shelf. Time-poor.

*Key questions:* Which herbs are earning their shelf space? What's tying up cash and not moving? What should I carry more of, less of, drop, or add? Where am I leaving money on the table on price?

### Rohan Jasani — Herbalist / Practitioner *(external)*
Consults with clients, designs custom formulas factoring energetics, and submits them to the apothecary through the practitioner portal. Source of most of the system's input data. Practices somewhat in isolation — he sees his own caseload and nothing else, and has no view of what the wider practitioner community is doing.

*Key questions:* What are other practitioners actually prescribing? Which herbs are rising or falling in use? Which herbs get paired together, and am I missing combinations I should know? How does my own practice compare — am I an outlier, and is that deliberate? What's getting hard to source?

### Priya Raman — Client *(external)*
A **regular** — sees Rohan quarterly for an ongoing constitutional protocol, with formulas adjusted each visit. Pays at pickup. Walks out of her appointment knowing a formula was ordered for her, but with no idea what happens next or when it'll be ready.

*Key questions:* Where is my formula right now? When can I pick it up? Is something holding it up, and do I need to do anything? How do I pay? What do I do if I have a question or a reaction?

### Supporting roles

**Devon Reyes — Inventory / Purchasing Manager.** Owns stock levels, supplier relationships, expiry risk, and reorder timing. Raises purchase orders, receives goods, assigns lots. Spends most of his time on his feet in the stockroom.

**Sam Alvarez — Compounder / Dispensary Tech.** Executes formulas at the bench: pulls by lot, weighs, mixes, labels, cleans down, packages. Consumes inventory rather than managing it.

**Nora Whitfield — Client Care Coordinator.** Front of house. Receives and confirms incoming orders, manages pickup and payment, walks clients through dosing and safety instructions at handoff, and fields the first report when something goes wrong.

**Cascade Botanicals — Supplier (domestic).** Organic grower-wholesaler in the Pacific Northwest supplying the bulk of the cut & sift assortment. Domestic sourcing means shorter, more predictable lead times than imported material. Object of supplier-performance analytics and the target of adverse-event escalation.

---

## D4. Workflows

### J1 — Formula submission → fulfillment → pickup *(the core loop)*

1. **Consult & design (Rohan).** Rohan meets with Priya and designs a formula, factoring in energetics alongside her medical conditions, current pharmaceuticals and supplements, allergies, the herbal actions being targeted, and any contraindications.
2. **Submit (Rohan → apothecary).** Rohan submits the order through the practitioner portal, specifying for each component the Latin binomial, plant part, preparation form, proportion, and dosing regimen, plus preparation instructions and safety notes. May submit a multi-part order — e.g. a tea and a companion tincture — as a single job.
3. **Intake & confirmation (Nora).** Order received and acknowledged; Priya is told when to expect it.
4. **Clinical & inventory validation (apothecary).** Safety review screens for low-dose botanicals and high-risk herb–drug interactions against the client's medication list; the fulfillment check confirms every component is in stock in the right part and form, in sufficient quantity, with acceptable expiry. Anything flagged goes back to Rohan; shortfalls route to Devon.
5. **Compound (Sam).** Pulls by lot, weighs and mixes to proportion, labels with Latin names, dosing, and any safety warnings, records the lot IDs consumed against the order, cleans down the station to prevent cross-contamination, and packages the order for pickup.
6. **Ready & notify (Nora).** Order marked ready; Priya notified.
7. **Handoff & payment (Nora → Priya).** Nora walks Priya through dosing and safety instructions, flags any low-dose or interaction warnings verbally as well as on the label, and collects payment. Rohan is credited with the order for relationship and volume tracking.

### J2 — Inventory replenishment *(Devon)*
Stock depletes through fulfillment → burn rate and days-of-cover are computed from history → reorder point is hit, accounting for supplier lead time → purchase order raised → goods received, assigned a new lot with its own expiry → shelf restocked. Goal is **just-in-time**: enough to never turn away an order, little enough that nothing expires on the shelf.

### J3 — Adverse event / reaction reporting
Priya reports a reaction — to Rohan, or to Nora at the counter → it's flagged against the specific order → the order is traced back to the exact lots consumed, and cross-checked against the safety flags raised at intake → if a pattern emerges across orders sharing a lot or supplier, it's escalated to Cascade Botanicals and the lot is quarantined. **Traceability from complaint → order → lot → supplier is non-negotiable.**

### J4 — Assortment review *(Maya, periodic/strategic)*
Owner reviews what's moving, what's dead, what's constrained. Decides what to expand, what to reduce, what to discontinue, and what to add based on unmet practitioner requests.

### J5 — Request for an herb not carried
Practitioner requests an herb the apothecary doesn't stock → request is logged → demand signal accumulates across practitioners → owner decides whether to add it to the assortment. Turns lost orders into a purchasing input.

---

## D5. Data Model

| Entity | Key attributes |
|---|---|
| **Herb** | **Latin binomial (authoritative ID)**, common name(s), tradition, energetics, herbal actions, contraindications, **low-dose flag**, known herb–drug interaction classes |
| **SKU** | herb + plant part + preparation form + unit of measure |
| **Lot** | SKU, supplier, received date, expiry date, quantity, unit cost |
| **Supplier** | name, domestic/import, lead time, fill rate, reliability score, herbs supplied |
| **Practitioner** | name, credential, tenure, contact, account status |
| **Client** | linked to practitioner, contact, order history, **medical conditions, current pharmaceuticals & supplements, allergies** |
| **Order** | practitioner, client, components, dosing regimen, prep instructions, safety notes, **safety-review status**, fulfillment status, price (apothecary-set) |
| **Order component** | SKU (Latin name + part + form), proportion/quantity, dose, lots consumed |
| **Safety flag** | order, type (low-dose botanical / herb–drug interaction / contraindication), severity, resolution, who confirmed |
| **Herb request** | practitioner, herb not carried, date, times requested |

**Note on identifiers:** Latin binomial, plant part, and preparation form are each required, not optional. Common names are ambiguous across traditions and regions, and different parts of the same plant are not substitutable — ambiguity in any of the three is a safety risk.
