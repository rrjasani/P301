// Generates app/src/data.js — deterministic seed data for the assortment dashboard.
// Run: node tools/generate-data.mjs (or `npm run generate-data` from app/)
//
// The dataset is anchored to a fixed AS_OF date so expiry maths and the
// trailing window stay stable no matter when the prototype is opened.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const AS_OF = new Date("2026-09-10T00:00:00Z");
const WINDOW_DAYS = 180;
const ANNUALIZE = 365 / WINDOW_DAYS; // scales trailing-window COGS up to a 365-day run rate
const MONTHS_IN_WINDOW = WINDOW_DAYS / 30;

/* ---------- deterministic PRNG (mulberry32) ---------- */
let _s = 0x9e3779b9;
const rnd = () => {
  _s |= 0; _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rf = (a, b) => a + rnd() * (b - a);
const ri = (a, b) => Math.floor(rf(a, b + 1));
const pick = (xs) => xs[Math.floor(rnd() * xs.length)];
const chance = (p) => rnd() < p;
const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

const dayOffset = (days) => {
  const d = new Date(AS_OF);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/* ---------- part & form vocabulary ---------- */
const PARTS = {
  rt: "Root", rz: "Rhizome", lf: "Leaf", fl: "Flower", ap: "Aerial parts",
  bk: "Bark", br: "Berry", fr: "Fruit", sd: "Seed", fb: "Fruiting body",
  hb: "Whole herb", rh: "Root & rhizome",
};
// Which preparation forms are plausible for a given plant part.
const FORMS_FOR = {
  rt: ["cs", "tn", "pw"], rz: ["cs", "tn", "pw"], rh: ["cs", "tn", "pw"],
  bk: ["cs", "tn"], lf: ["cs", "tn"], fl: ["cs", "tn"], ap: ["cs", "tn"],
  hb: ["cs", "tn"], br: ["cs", "tn", "pw"], fr: ["cs", "tn", "pw"],
  sd: ["cs", "tn", "pw"], fb: ["pw", "tn"],
};
const FORM_LABEL = {
  cs: "Cut & sift", tn: "Tincture", pw: "Powder",
};
const FORM_UOM = { cs: "oz", tn: "mL", pw: "oz" };

/* ---------- herb catalog ----------
   [binomial, common, tradition, energetics, actions, parts, lowDose, note]
   `note` is the clinical reason a slow-moving herb may still be worth stocking. */
const HERBS = [
  ["Achillea millefolium", "Yarrow", "Western", "cooling, drying", "diaphoretic, styptic, bitter", "ap|fl", 0, ""],
  ["Actaea racemosa", "Black Cohosh", "Western", "cooling, dispersing", "antispasmodic, emmenagogue", "rh", 0, "Few substitutes for menopausal musculoskeletal pain."],
  ["Agrimonia eupatoria", "Agrimony", "Western", "cooling, drying", "astringent, bitter tonic", "ap", 0, ""],
  ["Albizia julibrissin", "Mimosa Bark", "Chinese", "neutral, moving", "shen-calming, mood-lifting", "bk|fl", 0, ""],
  ["Althaea officinalis", "Marshmallow", "Western", "cooling, moistening", "demulcent, emollient", "rt|lf", 0, ""],
  ["Andrographis paniculata", "Andrographis", "Ayurvedic", "cooling, drying", "antimicrobial, bitter", "ap", 0, ""],
  ["Angelica archangelica", "Angelica", "Western", "warming, drying", "carminative, diaphoretic", "rt|sd", 0, ""],
  ["Angelica sinensis", "Dong Quai", "Chinese", "warming, moistening", "blood tonic, emmenagogue", "rt", 0, ""],
  ["Arctium lappa", "Burdock", "Western", "cooling, moistening", "alterative, lymphatic", "rt|sd", 0, ""],
  ["Arctostaphylos uva-ursi", "Uva Ursi", "Western", "cooling, drying", "urinary antiseptic, astringent", "lf", 0, ""],
  ["Artemisia annua", "Sweet Annie", "Chinese", "cooling, drying", "antiparasitic, febrifuge", "ap", 0, ""],
  ["Artemisia vulgaris", "Mugwort", "Western", "warming, drying", "bitter, emmenagogue, oneirogen", "ap", 0, ""],
  ["Asparagus racemosus", "Shatavari", "Ayurvedic", "cooling, moistening", "adaptogen, reproductive tonic", "rt", 0, ""],
  ["Astragalus membranaceus", "Astragalus", "Chinese", "warming, tonifying", "immune tonic, adaptogen", "rt", 0, ""],
  ["Atractylodes macrocephala", "Bai Zhu", "Chinese", "warming, drying", "spleen qi tonic, damp-drying", "rz", 0, ""],
  ["Avena sativa", "Milky Oat", "Western", "neutral, moistening", "nervine trophorestorative", "ap|sd", 0, ""],
  ["Bacopa monnieri", "Bacopa", "Ayurvedic", "cooling, moistening", "nootropic, nervine", "ap", 0, ""],
  ["Berberis aquifolium", "Oregon Grape", "Western", "cooling, drying", "alterative, bitter, antimicrobial", "rt", 0, "Domestic berberine source; stands in for at-risk goldenseal."],
  ["Boswellia serrata", "Boswellia", "Ayurvedic", "warming, drying", "anti-inflammatory, analgesic", "rz", 0, ""],
  ["Bupleurum chinense", "Bupleurum", "Chinese", "cooling, dispersing", "liver qi mover, harmonizer", "rt", 0, ""],
  ["Calendula officinalis", "Calendula", "Western", "warming, drying", "vulnerary, lymphatic, antifungal", "fl", 0, ""],
  ["Capsicum annuum", "Cayenne", "Western", "hot, drying", "circulatory stimulant, counterirritant", "fr", 0, ""],
  ["Centella asiatica", "Gotu Kola", "Ayurvedic", "cooling, moistening", "nervine, vulnerary, nootropic", "ap", 0, ""],
  ["Cinnamomum verum", "Cinnamon", "Western", "warming, drying", "carminative, hypoglycemic", "bk", 0, ""],
  ["Codonopsis pilosula", "Codonopsis", "Chinese", "neutral, tonifying", "qi tonic, gentle adaptogen", "rt", 0, ""],
  ["Cordyceps militaris", "Cordyceps", "Chinese", "warming, tonifying", "adaptogen, lung & kidney tonic", "fb", 0, ""],
  ["Crataegus monogyna", "Hawthorn", "Western", "neutral, moving", "cardiotonic, hypotensive", "br|lf|fl", 0, ""],
  ["Curcuma longa", "Turmeric", "Ayurvedic", "warming, drying", "anti-inflammatory, hepatic", "rz", 0, ""],
  ["Cynara scolymus", "Artichoke", "Western", "cooling, drying", "bitter, choleretic, hepatic", "lf", 0, ""],
  ["Dioscorea villosa", "Wild Yam", "Western", "cooling, moistening", "antispasmodic, anti-inflammatory", "rt", 0, ""],
  ["Echinacea purpurea", "Echinacea", "Western", "cooling, dispersing", "immune stimulant, lymphatic", "rt|ap", 0, ""],
  ["Eleutherococcus senticosus", "Eleuthero", "Chinese", "warming, tonifying", "adaptogen, stamina tonic", "rt", 0, ""],
  ["Equisetum arvense", "Horsetail", "Western", "cooling, drying", "mineral tonic, urinary astringent", "ap", 0, ""],
  ["Eschscholzia californica", "California Poppy", "Western", "cooling, relaxing", "anodyne, hypnotic", "ap", 0, ""],
  ["Eupatorium perfoliatum", "Boneset", "Western", "cooling, dispersing", "diaphoretic, febrifuge", "ap", 0, "The classic influenza diaphoretic; seasonal demand only."],
  ["Filipendula ulmaria", "Meadowsweet", "Western", "cooling, drying", "antacid, anti-inflammatory", "ap", 0, ""],
  ["Foeniculum vulgare", "Fennel", "Western", "warming, moving", "carminative, galactagogue", "sd", 0, ""],
  ["Ganoderma lucidum", "Reishi", "Chinese", "neutral, tonifying", "adaptogen, shen tonic, immune", "fb", 0, ""],
  ["Gentiana lutea", "Gentian", "Western", "cooling, drying", "bitter tonic, digestive", "rt", 0, ""],
  ["Ginkgo biloba", "Ginkgo", "Chinese", "neutral, moving", "cerebral circulatory, antioxidant", "lf", 0, ""],
  ["Glycyrrhiza glabra", "Licorice", "Western", "warming, moistening", "demulcent, adrenal tonic, harmonizer", "rt", 0, ""],
  ["Grindelia robusta", "Gumweed", "Western", "warming, drying", "expectorant, antispasmodic", "fl|ap", 0, "Specific for spasmodic wet cough; nothing else substitutes cleanly."],
  ["Hamamelis virginiana", "Witch Hazel", "Western", "cooling, drying", "astringent, vulnerary", "bk|lf", 0, ""],
  ["Harpagophytum procumbens", "Devil's Claw", "Western", "cooling, drying", "anti-inflammatory, bitter", "rt", 0, ""],
  ["Hericium erinaceus", "Lion's Mane", "Chinese", "neutral, tonifying", "nootropic, nerve regenerative", "fb", 0, ""],
  ["Humulus lupulus", "Hops", "Western", "cooling, drying", "sedative, bitter, anaphrodisiac", "fl", 0, ""],
  ["Hydrastis canadensis", "Goldenseal", "Western", "cooling, drying", "mucous membrane tonic, antimicrobial", "rt", 0, "At-risk species; high cost and slow turns are expected, not a failure."],
  ["Hypericum perforatum", "St. John's Wort", "Western", "warming, drying", "antidepressant, nervine, antiviral", "ap|fl", 0, ""],
  ["Inula helenium", "Elecampane", "Western", "warming, drying", "expectorant, bitter, antitussive", "rt", 0, ""],
  ["Lavandula angustifolia", "Lavender", "Western", "cooling, relaxing", "nervine, carminative, antiseptic", "fl", 0, ""],
  ["Lentinula edodes", "Shiitake", "Chinese", "neutral, tonifying", "immune modulator", "fb", 0, ""],
  ["Leonurus cardiaca", "Motherwort", "Western", "cooling, relaxing", "cardiac nervine, emmenagogue", "ap", 0, ""],
  ["Ligusticum chuanxiong", "Chuan Xiong", "Chinese", "warming, moving", "blood mover, analgesic", "rz", 0, ""],
  ["Lobelia inflata", "Lobelia", "Western", "warming, dispersing", "antispasmodic, respiratory relaxant", "ap", 1, "Low-dose botanical — small volume is correct, not underperformance."],
  ["Lycium barbarum", "Goji", "Chinese", "neutral, moistening", "yin tonic, ophthalmic", "fr", 0, ""],
  ["Matricaria chamomilla", "Chamomile", "Western", "cooling, relaxing", "carminative, nervine, anti-inflammatory", "fl", 0, ""],
  ["Melissa officinalis", "Lemon Balm", "Western", "cooling, relaxing", "nervine, antiviral, carminative", "lf", 0, ""],
  ["Mentha piperita", "Peppermint", "Western", "cooling, dispersing", "carminative, antispasmodic", "lf", 0, ""],
  ["Mitchella repens", "Partridgeberry", "Western", "cooling, astringent", "parturient, uterine tonic", "ap", 0, "Partus preparator with no ready substitute; low but non-negotiable volume."],
  ["Nepeta cataria", "Catnip", "Western", "cooling, relaxing", "carminative, mild sedative", "ap", 0, ""],
  ["Ocimum tenuiflorum", "Holy Basil", "Ayurvedic", "warming, drying", "adaptogen, nervine, carminative", "lf|ap", 0, ""],
  ["Paeonia lactiflora", "White Peony", "Chinese", "cooling, moistening", "blood tonic, antispasmodic", "rt", 0, ""],
  ["Panax ginseng", "Asian Ginseng", "Chinese", "warming, tonifying", "adaptogen, qi tonic", "rt", 0, ""],
  ["Panax quinquefolius", "American Ginseng", "Chinese", "cooling, tonifying", "yin-sparing adaptogen", "rt", 0, ""],
  ["Passiflora incarnata", "Passionflower", "Western", "cooling, relaxing", "hypnotic, anxiolytic", "ap", 0, ""],
  ["Petroselinum crispum", "Parsley", "Western", "warming, drying", "diuretic, emmenagogue", "lf|rt", 0, ""],
  ["Phyllanthus emblica", "Amla", "Ayurvedic", "cooling, moistening", "rasayana, antioxidant", "fr", 0, ""],
  ["Phytolacca americana", "Poke", "Western", "cooling, dispersing", "lymphatic, alterative", "rt", 1, "Low-dose botanical — dispensed in drops; volume is inherently tiny."],
  ["Piper methysticum", "Kava", "Western", "warming, relaxing", "anxiolytic, muscle relaxant", "rt", 0, ""],
  ["Piper nigrum", "Black Pepper", "Ayurvedic", "hot, drying", "carminative, bioavailability enhancer", "fr", 0, ""],
  ["Plantago major", "Plantain", "Western", "cooling, moistening", "vulnerary, demulcent", "lf", 0, ""],
  ["Reynoutria multiflora", "Fo-Ti", "Chinese", "warming, moistening", "jing tonic, blood tonic", "rt", 0, ""],
  ["Rehmannia glutinosa", "Rehmannia", "Chinese", "cooling, moistening", "yin tonic, kidney tonic", "rt", 0, ""],
  ["Rhodiola rosea", "Rhodiola", "Western", "cooling, tonifying", "adaptogen, antifatigue", "rt", 0, ""],
  ["Rosa canina", "Rose Hips", "Western", "cooling, astringent", "nutritive, antioxidant", "fr", 0, ""],
  ["Rubus idaeus", "Red Raspberry", "Western", "cooling, astringent", "uterine tonic, astringent", "lf", 0, ""],
  ["Rumex crispus", "Yellow Dock", "Western", "cooling, drying", "alterative, gentle laxative", "rt", 0, ""],
  ["Salvia miltiorrhiza", "Dan Shen", "Chinese", "cooling, moving", "blood mover, cardioprotective", "rt", 0, ""],
  ["Salvia officinalis", "Sage", "Western", "warming, drying", "antihidrotic, antiseptic", "lf", 0, ""],
  ["Sambucus nigra", "Elder", "Western", "cooling, dispersing", "antiviral, diaphoretic", "br|fl", 0, ""],
  ["Schisandra chinensis", "Schisandra", "Chinese", "warming, astringent", "adaptogen, hepatoprotective", "br", 0, ""],
  ["Scutellaria baicalensis", "Baikal Skullcap", "Chinese", "cooling, drying", "heat-clearing, anti-inflammatory", "rt", 0, ""],
  ["Scutellaria lateriflora", "Skullcap", "Western", "cooling, relaxing", "nervine, anxiolytic", "ap", 0, ""],
  ["Serenoa repens", "Saw Palmetto", "Western", "warming, moistening", "prostatic trophorestorative", "br", 0, ""],
  ["Silybum marianum", "Milk Thistle", "Western", "cooling, drying", "hepatoprotective, choleretic", "sd", 0, ""],
  ["Smilax ornata", "Sarsaparilla", "Western", "warming, drying", "alterative, anti-inflammatory", "rt", 0, ""],
  ["Stellaria media", "Chickweed", "Western", "cooling, moistening", "demulcent, vulnerary", "ap", 0, ""],
  ["Symphytum officinale", "Comfrey", "Western", "cooling, moistening", "vulnerary, cell-proliferant", "lf|rt", 0, "Topical-only external protocols; pyrrolizidine content caps internal use."],
  ["Syzygium aromaticum", "Clove", "Ayurvedic", "hot, drying", "analgesic, antimicrobial", "fl", 0, ""],
  ["Tanacetum parthenium", "Feverfew", "Western", "cooling, drying", "antimigraine, anti-inflammatory", "lf|ap", 0, ""],
  ["Taraxacum officinale", "Dandelion", "Western", "cooling, drying", "bitter, diuretic, hepatic", "rt|lf", 0, ""],
  ["Terminalia chebula", "Haritaki", "Ayurvedic", "warming, drying", "rasayana, gentle laxative", "fr", 0, ""],
  ["Thymus vulgaris", "Thyme", "Western", "warming, drying", "antimicrobial, expectorant", "ap", 0, ""],
  ["Tilia europaea", "Linden", "Western", "cooling, moistening", "nervine, diaphoretic, hypotensive", "fl", 0, ""],
  ["Tinospora cordifolia", "Guduchi", "Ayurvedic", "cooling, tonifying", "rasayana, immune modulator", "rz", 0, ""],
  ["Trametes versicolor", "Turkey Tail", "Chinese", "neutral, tonifying", "immune modulator, polysaccharide", "fb", 0, ""],
  ["Trifolium pratense", "Red Clover", "Western", "cooling, moistening", "alterative, lymphatic", "fl", 0, ""],
  ["Trigonella foenum-graecum", "Fenugreek", "Ayurvedic", "warming, moistening", "galactagogue, demulcent", "sd", 0, ""],
  ["Turnera diffusa", "Damiana", "Western", "warming, dispersing", "nervine, aphrodisiac", "lf", 0, ""],
  ["Ulmus rubra", "Slippery Elm", "Western", "neutral, moistening", "demulcent, nutritive", "bk", 0, "At-risk species; stocked deliberately despite thin turns."],
  ["Urtica dioica", "Nettle", "Western", "cooling, drying", "nutritive, antihistamine, diuretic", "lf|rt|sd", 0, ""],
  ["Vaccinium myrtillus", "Bilberry", "Western", "cooling, astringent", "ophthalmic, vascular tonic", "br", 0, ""],
  ["Valeriana officinalis", "Valerian", "Western", "warming, relaxing", "hypnotic, antispasmodic", "rt", 0, ""],
  ["Verbascum thapsus", "Mullein", "Western", "cooling, moistening", "expectorant, demulcent, lymphatic", "lf|fl", 0, ""],
  ["Verbena officinalis", "Vervain", "Western", "cooling, relaxing", "nervine, bitter, diaphoretic", "ap", 0, ""],
  ["Viburnum opulus", "Cramp Bark", "Western", "warming, relaxing", "antispasmodic, uterine relaxant", "bk", 0, ""],
  ["Viburnum prunifolium", "Black Haw", "Western", "warming, relaxing", "uterine antispasmodic", "bk", 0, "Threatened-miscarriage protocols; irreplaceable in a small caseload."],
  ["Vitex agnus-castus", "Chaste Tree", "Western", "warming, drying", "hormonal modulator, galactagogue", "br", 0, ""],
  ["Withania somnifera", "Ashwagandha", "Ayurvedic", "warming, moistening", "adaptogen, nervine tonic", "rt", 0, ""],
  ["Wolfiporia extensa", "Fu Ling", "Chinese", "neutral, draining", "damp-draining, spleen tonic", "fb", 0, ""],
  ["Zanthoxylum clava-herculis", "Prickly Ash", "Western", "warming, dispersing", "circulatory stimulant, sialagogue", "bk", 0, ""],
  ["Zingiber officinale", "Ginger", "Western", "hot, drying", "carminative, diaphoretic, antiemetic", "rz", 0, ""],
  ["Ziziphus jujuba", "Jujube", "Chinese", "warming, tonifying", "shen-calming, harmonizer", "sd|fr", 0, ""],
];

const SUPPLIERS = [
  { name: "Cascade Botanicals", domestic: true, leadDays: 14, fillRate: 0.96 },
  { name: "Ridgeline Roots", domestic: true, leadDays: 21, fillRate: 0.92 },
  { name: "Meridian Imports", domestic: false, leadDays: 58, fillRate: 0.84 },
  { name: "Pacific Mycology", domestic: true, leadDays: 18, fillRate: 0.94 },
  { name: "Ayur Sourcing Co.", domestic: false, leadDays: 47, fillRate: 0.88 },
];
const supplierFor = (tradition, part) => {
  if (part === "fb") return SUPPLIERS[3];
  if (tradition === "Ayurvedic") return chance(0.7) ? SUPPLIERS[4] : SUPPLIERS[2];
  if (tradition === "Chinese") return chance(0.65) ? SUPPLIERS[2] : SUPPLIERS[1];
  return chance(0.75) ? SUPPLIERS[0] : SUPPLIERS[1];
};

const PRACTITIONERS = [
  "Rohan Jasani, RH (AHG)", "Delphine Okafor, LAc", "Marcus Feldt, ND",
  "Ana Belmonte, RH (AHG)", "Yuki Tanabe, LAc", "Priyanka Sundar, ND",
  "Corinne Vasquez, RH (AHG)", "Tobias Lindqvist, LAc", "Nadia Rahimi, ND",
  "Samuel Achebe, RH (AHG)", "Wen Li Chao, LAc", "Beatrix Novak, ND",
];
const CLIENTS = [
  "P. Raman", "J. Okonjo", "M. Castellanos", "T. Whitfield", "L. Bergström",
  "K. Nakamura", "D. Oyelaran", "S. Freeman", "R. Contreras", "A. Bhatt",
  "N. Kowalski", "E. Mbeki", "H. Lindgren", "C. Duval", "F. Rahman",
];

/* ---------- build SKUs ---------- */
const skus = [];
let skuSeq = 0;

HERBS.forEach((h, herbIdx) => {
  const [binomial, common, tradition, energetics, actions, partStr, lowDose, note] = h;
  const parts = partStr.split("|");

  // A herb is carried in 1–3 part×form combinations.
  const combos = [];
  parts.forEach((p) => {
    const forms = FORMS_FOR[p];
    // Cut & sift (or powder for mushrooms) is the staple; tincture is common.
    const staple = forms[0];
    combos.push([p, staple]);
    if (chance(0.78) && forms.includes("tn")) combos.push([p, "tn"]);
    if (chance(0.26) && forms.includes("pw") && staple !== "pw") combos.push([p, "pw"]);
  });

  combos.forEach(([part, form]) => {
    skuSeq += 1;
    const uom = FORM_UOM[form];

    // Resolved once per SKU — reused for both the cost basis below and the
    // supplier/lots fields further down, so a SKU's import markup always
    // agrees with the supplier the drawer actually displays.
    const supplier = supplierFor(tradition, part);

    // --- cost basis -------------------------------------------------------
    const rare = ["Hydrastis canadensis", "Panax ginseng", "Panax quinquefolius",
      "Ulmus rubra", "Piper methysticum", "Cordyceps militaris"].includes(binomial);
    let unitCost;
    if (form === "tn") unitCost = rf(0.16, 0.42) * (rare ? 2.3 : 1);      // per mL
    else if (form === "pw") unitCost = rf(1.1, 3.4) * (rare ? 2.6 : 1);   // per oz
    else unitCost = rf(0.75, 2.8) * (rare ? 3.1 : 1);                     // per oz
    if (["rt", "rz", "rh", "bk"].includes(part)) unitCost *= rf(1.15, 1.5);
    if (!supplier.domestic) unitCost *= rf(1.05, 1.25);
    unitCost = round(unitCost, 3);

    // --- demand tier ------------------------------------------------------
    const r = rnd();
    let tier;
    if (r < 0.06) tier = "star";
    else if (r < 0.36) tier = "steady";
    else if (r < 0.70) tier = "moderate";
    else if (r < 0.92) tier = "slow";
    else tier = "dead";
    // Low-dose botanicals move in tiny volumes by nature.
    if (lowDose && tier !== "dead") tier = "slow";

    const baseUnits = { star: rf(420, 900), steady: rf(150, 400), moderate: rf(55, 150),
      slow: rf(6, 50), dead: 0 }[tier];
    // Tinctures are dispensed in mL, so the raw count runs an order higher.
    const units = Math.round(baseUnits * (form === "tn" ? rf(3.2, 5.0) : 1));

    // --- pricing ----------------------------------------------------------
    // Apothecary sets price (DOMAIN §D2). Markup drifts — that drift is the
    // pricing opportunity the dashboard surfaces (R5).
    let markup = rf(2.15, 3.55);
    if (tier === "star" && chance(0.45)) markup = rf(1.85, 2.35); // underpriced winners
    const price = round(unitCost * markup, 3);

    const revenue = round(units * price, 2);
    const cogs = round(units * unitCost, 2);
    const marginDollars = round(revenue - cogs, 2);
    const marginPct = revenue > 0 ? round(marginDollars / revenue, 4) : 0;

    // --- inventory --------------------------------------------------------
    const monthsCover = { star: rf(1.2, 3.0), steady: rf(2.0, 4.5), moderate: rf(3.0, 7.0),
      slow: rf(8, 26), dead: 0 }[tier];
    const monthlyUnits = units / MONTHS_IN_WINDOW;
    // Dead stock is dead precisely because it was over-bought — it holds more
    // capital per SKU than its (nonexistent) movement would ever justify.
    let onHand = tier === "dead"
      ? Math.round(rf(34, 210) * (form === "tn" ? 3.2 : 1))
      : Math.max(1, Math.round(monthlyUnits * monthsCover));
    const capital = round(onHand * unitCost, 2);

    // Annualised turns: trailing-window COGS scaled to a 365-day run rate,
    // against inventory at cost.
    const turns = capital > 0 ? round((cogs * ANNUALIZE) / capital, 3) : 0;

    const lastDispensedDays = tier === "dead"
      ? -ri(185, 430)
      : -ri(0, Math.max(1, Math.round(28 / (monthlyUnits > 0 ? Math.min(monthlyUnits, 30) / MONTHS_IN_WINDOW : 1))));

    // --- practitioner breadth (R4) ---------------------------------------
    let practitionerCount;
    if (tier === "dead") practitionerCount = ri(0, 1);
    else if (tier === "slow") practitionerCount = ri(1, 3);
    else if (tier === "moderate") practitionerCount = ri(2, 6);
    else if (tier === "steady") practitionerCount = ri(3, 9);
    else practitionerCount = ri(5, 11);
    // Deliberate concentration risk: some strong sellers ride on one practitioner.
    if ((tier === "star" || tier === "steady") && chance(0.16)) practitionerCount = ri(1, 2);

    const prescribers = [];
    const pool = [...PRACTITIONERS];
    for (let i = 0; i < practitionerCount && pool.length; i++) {
      prescribers.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
    }

    // --- lots -------------------------------------------------------------
    const shelfMonths = form === "tn" ? ri(36, 60) : ["rt", "rz", "rh", "bk"].includes(part) ? ri(20, 30) : ri(12, 20);
    const lotCount = onHand > 0 ? (tier === "dead" ? ri(1, 2) : ri(1, 3)) : 0;
    const lots = [];
    let remaining = onHand;
    for (let i = 0; i < lotCount; i++) {
      const last = i === lotCount - 1;
      const qty = last ? remaining : Math.max(1, Math.round(remaining * rf(0.3, 0.6)));
      remaining -= qty;
      // Stock that stopped moving keeps ageing on the shelf, so expiry risk
      // concentrates in exactly the SKUs that are least able to earn it back.
      const receivedDaysAgo = tier === "dead" ? ri(240, 540)
        : tier === "slow" ? ri(120, 400)
        : ri(20, 300);
      const expiryDays = -receivedDaysAgo + shelfMonths * 30;
      lots.push({
        id: `L-${String(skuSeq).padStart(3, "0")}-${i + 1}`,
        supplier: supplier.name,
        received: dayOffset(-receivedDaysAgo),
        expiry: dayOffset(expiryDays),
        daysToExpiry: expiryDays,
        qty,
        unitCost: round(unitCost * rf(0.94, 1.07), 3),
      });
      if (remaining <= 0) break;
    }

    // --- recent order lines (R9 drill-down) -------------------------------
    const orderLines = [];
    const lineCount = tier === "dead" ? 0 : Math.min(8, Math.max(1, Math.round(units / rf(18, 60))));
    for (let i = 0; i < lineCount; i++) {
      const daysAgo = ri(1, WINDOW_DAYS);
      orderLines.push({
        id: `ORD-${8200 + skuSeq * 7 + i}`,
        date: dayOffset(-daysAgo),
        practitioner: prescribers.length ? pick(prescribers) : pick(PRACTITIONERS),
        client: pick(CLIENTS),
        qty: round(rf(form === "tn" ? 15 : 1.5, form === "tn" ? 120 : 12), 1),
        lot: lots.length ? pick(lots).id : "—",
      });
    }
    orderLines.sort((a, b) => (a.date < b.date ? 1 : -1));

    const isProtected = !!note && (tier === "slow" || tier === "dead" || lowDose === 1);

    skus.push({
      id: `SKU-${String(skuSeq).padStart(3, "0")}`,
      herbId: herbIdx,
      binomial, common, tradition, energetics, actions,
      part: PARTS[part], partCode: part,
      form: FORM_LABEL[form], formCode: form,
      uom, onHand, unitCost, price, capital,
      units, revenue, cogs, marginDollars, marginPct, turns,
      lastDispensed: lastDispensedDays === null ? null : dayOffset(lastDispensedDays),
      daysSinceDispensed: Math.abs(lastDispensedDays),
      practitionerCount: prescribers.length,
      prescribers,
      lowDose: !!lowDose,
      protected: isProtected,
      protectedReason: isProtected ? note : "",
      clinicalNote: note,
      supplier: supplier.name,
      supplierDomestic: supplier.domestic,
      supplierLeadDays: supplier.leadDays,
      shelfMonths,
      lots,
      orderLines,
      tier,
    });
  });
});

/* ---------- dispositions (R2) ----------
   Thresholds are the assortment medians, so the quadrant is self-calibrating. */
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const medTurns = round(median(skus.map((s) => s.turns)), 3);
const medMargin = round(median(skus.filter((s) => s.revenue > 0).map((s) => s.marginPct)), 4);

skus.forEach((s) => {
  const fast = s.turns >= medTurns;
  const rich = s.marginPct >= medMargin;
  s.disposition = fast && rich ? "expand" : fast && !rich ? "hold" : !fast && rich ? "reduce" : "discontinue";
  s.dead = s.units === 0;
  if (s.dead) s.disposition = "discontinue";

  // Impact framing (R8) — what the recommended action is worth.
  if (s.disposition === "discontinue") s.impact = { kind: "capital freed", value: round(s.capital, 2) };
  else if (s.disposition === "reduce") s.impact = { kind: "capital freed", value: round(s.capital * 0.45, 2) };
  else if (s.disposition === "hold") s.impact = { kind: "margin gained", value: round(Math.max(0, medMargin - s.marginPct) * s.revenue, 2) };
  else s.impact = { kind: "margin gained", value: round(s.marginDollars * rf(0.18, 0.34), 2) };

  // Expiry exposure — capital in lots expiring inside 90 days.
  s.expiring90 = round(s.lots.filter((l) => l.daysToExpiry <= 90).reduce((a, l) => a + l.qty * l.unitCost, 0), 2);
  s.expiring60 = round(s.lots.filter((l) => l.daysToExpiry <= 60).reduce((a, l) => a + l.qty * l.unitCost, 0), 2);
  s.expiring30 = round(s.lots.filter((l) => l.daysToExpiry <= 30).reduce((a, l) => a + l.qty * l.unitCost, 0), 2);

  // Concentration risk (R4): meaningful revenue riding on ≤2 practitioners.
  s.concentrated = s.practitionerCount > 0 && s.practitionerCount <= 2 && s.revenue >= 900;

  // Pricing opportunity (R5): steady movement, margin below the assortment median.
  s.repriceCandidate = s.units > 0 && s.turns >= medTurns * 0.8 && s.marginPct < medMargin - 0.04;
  s.repriceUpside = s.repriceCandidate ? round((medMargin - s.marginPct) * s.revenue, 2) : 0;
});

/* ---------- unmet demand (R7, journey J5) ---------- */
const REQUESTS = [
  ["Cimicifuga foetida", "Sheng Ma", "Chinese", 14, 5, "Requested for prolapse and yang-raising formulas."],
  ["Corydalis yanhusuo", "Yan Hu Suo", "Chinese", 12, 4, "Strong analgesic; repeatedly requested for dysmenorrhoea."],
  ["Rhodiola crenulata", "Hong Jing Tian", "Chinese", 9, 3, "Preferred over R. rosea by two practitioners."],
  ["Sceletium tortuosum", "Kanna", "Western", 8, 4, "Mood support; growing interest."],
  ["Withania somnifera (leaf)", "Ashwagandha Leaf", "Ayurvedic", 7, 2, "Distinct from the root; requested for topical work."],
  ["Polygala tenuifolia", "Yuan Zhi", "Chinese", 7, 3, "Shen-calming and nootropic pairing."],
  ["Anemopsis californica", "Yerba Mansa", "Western", 6, 3, "Regional antimicrobial; domestic sourcing available."],
  ["Ptychopetalum olacoides", "Muira Puama", "Western", 5, 2, "Nervine aphrodisiac."],
  ["Lepidium meyenii", "Maca", "Western", 5, 3, "Frequently requested by clients directly."],
  ["Crocus sativus", "Saffron", "Ayurvedic", 4, 2, "Mood indication; cost is the blocker."],
  ["Gymnema sylvestre", "Gurmar", "Ayurvedic", 4, 2, "Blood-sugar protocols."],
  ["Justicia adhatoda", "Vasaka", "Ayurvedic", 3, 2, "Respiratory formulas."],
];
const requests = REQUESTS.map(([binomial, common, tradition, times, practitioners, why], i) => {
  const estPrice = round(rf(1.4, 4.2), 2);
  const estUnits = times * ri(8, 22);
  return {
    id: `REQ-${100 + i}`,
    binomial, common, tradition, times, practitioners, why,
    firstRequested: dayOffset(-ri(60, 320)),
    lastRequested: dayOffset(-ri(2, 45)),
    projectedRevenue: round(estUnits * estPrice, 2),
    projectedMargin: round(estUnits * estPrice * rf(0.55, 0.68), 2),
  };
});

/* ---------- stockouts that blocked an order (R7) ---------- */
const stockoutPool = skus.filter((s) => s.tier === "star" || s.tier === "steady");
const stockouts = [];
for (let i = 0; i < 9; i++) {
  const s = stockoutPool[Math.floor(rnd() * stockoutPool.length)];
  if (!s || stockouts.some((x) => x.skuId === s.id)) continue;
  stockouts.push({
    skuId: s.id,
    label: `${s.common} — ${s.part}, ${s.form}`,
    binomial: s.binomial,
    date: dayOffset(-ri(5, 150)),
    ordersBlocked: ri(1, 5),
    revenueLost: round(rf(120, 940), 2),
    supplier: s.supplier,
    leadDays: s.supplierLeadDays,
  });
}
stockouts.sort((a, b) => b.revenueLost - a.revenueLost);

/* ---------- rollups ---------- */
const sum = (xs, f) => round(xs.reduce((a, x) => a + f(x), 0), 2);
const totalCapital = sum(skus, (s) => s.capital);
const deadSkus = skus.filter((s) => s.dead);
const deadCapital = sum(deadSkus, (s) => s.capital);
const totalRevenue = sum(skus, (s) => s.revenue);
const totalCogs = sum(skus, (s) => s.cogs);

const meta = {
  asOf: AS_OF.toISOString().slice(0, 10),
  windowDays: WINDOW_DAYS,
  skuCount: skus.length,
  herbCount: HERBS.length,
  totalCapital,
  deadCapital,
  deadCount: deadSkus.length,
  deadShare: round(deadCapital / totalCapital, 4),
  totalRevenue,
  totalCogs,
  blendedMargin: round((totalRevenue - totalCogs) / totalRevenue, 4),
  blendedTurns: round((totalCogs * ANNUALIZE) / totalCapital, 3),
  medianTurns: medTurns,
  medianMargin: medMargin,
  expiring90: sum(skus, (s) => s.expiring90),
  expiring30: sum(skus, (s) => s.expiring30),
  practitionerCount: PRACTITIONERS.length,
  suppliers: SUPPLIERS,
};

const payload = { meta, skus, requests, stockouts, practitioners: PRACTITIONERS };

mkdirSync(join(ROOT, "app", "src"), { recursive: true });
writeFileSync(
  join(ROOT, "app", "src", "data.js"),
  `/* Generated by tools/generate-data.mjs — do not edit by hand. */\nexport const APOTHECARY = ${JSON.stringify(payload)};\n`
);

console.log(`SKUs            ${skus.length} across ${HERBS.length} herbs`);
console.log(`Capital         $${totalCapital.toLocaleString()}`);
console.log(`Dead stock      ${deadSkus.length} SKUs · $${deadCapital.toLocaleString()} (${(meta.deadShare * 100).toFixed(1)}%)`);
console.log(`Expiring <=90d  $${meta.expiring90.toLocaleString()}  (<=30d $${meta.expiring30.toLocaleString()})`);
console.log(`Blended margin  ${(meta.blendedMargin * 100).toFixed(1)}%   turns ${meta.blendedTurns}`);
console.log(`Medians         turns ${medTurns} · margin ${(medMargin * 100).toFixed(1)}%`);
const byDisp = skus.reduce((a, s) => ((a[s.disposition] = (a[s.disposition] || 0) + 1), a), {});
console.log(`Dispositions    ${JSON.stringify(byDisp)}`);
console.log(`Concentrated    ${skus.filter((s) => s.concentrated).length}`);
console.log(`Reprice         ${skus.filter((s) => s.repriceCandidate).length}`);
console.log(`Protected       ${skus.filter((s) => s.protected).length}`);
