<script setup>
import { ref, computed, watch } from "vue";
import { fmtMoney, fmtPct } from "../format.js";

const props = defineProps({
  list: { type: Array, required: true },
  allSkus: { type: Array, required: true },
  meta: { type: Object, required: true },
});
const emit = defineEmits(["open-drawer"]);

/* Position (turns vs margin, split at the assortment median) IS the
   disposition — corner labels carry that meaning, so dot color stays a
   single neutral hue and is not spent re-encoding what position already
   shows. Size = capital (sqrt scale). Protected = ring, not color, so the
   channel stays free for the one flag that matters most on this chart. */
const CHART_W = 720,
  CHART_H = 480;
const PAD = { top: 28, right: 28, bottom: 46, left: 56 };
const plotW = CHART_W - PAD.left - PAD.right;
const plotH = CHART_H - PAD.top - PAD.bottom;

const view = ref("chart"); // 'chart' | 'table'

// Scale is derived from the full catalog, not the filtered list, so a SKU's
// position on the chart never shifts just because a filter narrowed the view.
const xMax = computed(() => {
  const vals = props.allSkus.map((s) => s.turns).filter((v) => isFinite(v));
  const sorted = [...vals].sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 1;
  return Math.max(p95 * 1.15, props.meta.medianTurns * 2, 1);
});
const yRange = computed(() => {
  const vals = props.allSkus.map((s) => s.marginPct).filter((v) => isFinite(v));
  const min = Math.min(0, ...vals);
  const max = Math.max(...vals, props.meta.medianMargin + 0.1);
  return [min, max * 1.05];
});
const capMax = computed(() => Math.max(...props.allSkus.map((s) => s.capital), 1));

function xScale(turns) {
  return PAD.left + (Math.min(turns, xMax.value) / xMax.value) * plotW;
}
function yScale(m) {
  const [yMin, yMax] = yRange.value;
  return PAD.top + plotH - ((m - yMin) / (yMax - yMin)) * plotH;
}
function rScale(cap) {
  return 3 + Math.sqrt(Math.max(cap, 0) / capMax.value) * 16;
}

const medX = computed(() => xScale(props.meta.medianTurns));
const medY = computed(() => yScale(props.meta.medianMargin));

const xStep = computed(() => (xMax.value > 8 ? 2 : 1));
const xTicks = computed(() => {
  const ticks = [];
  for (let t = 0; t <= xMax.value; t += xStep.value) ticks.push(t);
  return ticks;
});
const yTicks = computed(() => {
  const [yMin, yMax] = yRange.value;
  const step = 0.2;
  const ticks = [];
  for (let m = Math.ceil(yMin / step) * step; m <= yMax; m += step) ticks.push(m);
  return ticks;
});

const corners = [
  { x: PAD.left + plotW - 6, y: PAD.top + 14, anchor: "end", label: "Expand" },
  { x: PAD.left + plotW - 6, y: PAD.top + plotH - 8, anchor: "end", label: "Hold" },
  { x: PAD.left + 6, y: PAD.top + 14, anchor: "start", label: "Reduce" },
  { x: PAD.left + 6, y: PAD.top + plotH - 8, anchor: "start", label: "Discontinue" },
];

const points = computed(() => {
  const [yMin, yMax] = yRange.value;
  return [...props.list]
    .sort((a, b) => a.capital - b.capital) // bigger bets painted on top
    .map((s) => ({
      s,
      cx: xScale(Math.min(s.turns, xMax.value)),
      cy: yScale(Math.max(yMin, Math.min(s.marginPct, yMax))),
      r: rScale(s.capital),
    }));
});

const counts = computed(() => {
  const c = { expand: 0, hold: 0, reduce: 0, discontinue: 0 };
  props.list.forEach((s) => c[s.disposition]++);
  return c;
});

/* ---------- nearest-point hover ----------
   A single transparent overlay finds the *nearest* point to the pointer,
   rather than per-dot hit circles — with 200+ marks in this plot, oversized
   hit circles collide and steal each other's hover; nearest-point avoids
   that entirely (see dataviz interaction.md, "dense scatter" guidance). */
const svgEl = ref(null);
const wrapEl = ref(null);
const hovered = ref(null);
const tooltipStyle = ref({ left: "0px", top: "0px" });

// The list just changed under a stale hover — drop it rather than leave a
// tooltip floating for a SKU the new filter may have dropped from view.
watch(
  () => props.list,
  () => {
    hovered.value = null;
  }
);

function nearestPoint(ev) {
  const ctm = svgEl.value.getScreenCTM();
  if (!ctm) return null;
  const svgX = (ev.clientX - ctm.e) / ctm.a;
  const svgY = (ev.clientY - ctm.f) / ctm.d;
  let best = null,
    bestDist = Infinity;
  for (const p of points.value) {
    const d = Math.hypot(p.cx - svgX, p.cy - svgY);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  // Threshold in SVG units so the pointer must be reasonably close, not
  // anywhere on the plot — grows a little with the point's own radius.
  if (best && bestDist <= best.r + 16) return best;
  return null;
}

function onOverlayMove(ev) {
  const p = nearestPoint(ev);
  hovered.value = p;
  if (p) {
    const rect = wrapEl.value.getBoundingClientRect();
    tooltipStyle.value = {
      left: ev.clientX - rect.left + 14 + "px",
      top: ev.clientY - rect.top + 14 + "px",
    };
  }
}
function onOverlayLeave() {
  hovered.value = null;
}
function onOverlayClick(ev) {
  const p = nearestPoint(ev);
  if (p) emit("open-drawer", p.s.id);
}

/* ---------- table view: sort + per-column filters ----------
   Local to this table only — narrows/reorders what's displayed here without
   touching the chart or any other section, which stay scoped to the filter
   row above. */
const sortKey = ref("capital"); // 'binomial' | 'disposition' | 'turns' | 'marginPct' | 'capital'
const sortDir = ref("desc"); // 'asc' | 'desc'

function setSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = key === "binomial" || key === "disposition" ? "asc" : "desc";
  }
}
function ariaSort(key) {
  if (sortKey.value !== key) return "none";
  return sortDir.value === "asc" ? "ascending" : "descending";
}

const colFilters = ref({
  search: "",
  disposition: "",
  turnsMin: "", turnsMax: "",
  marginMin: "", marginMax: "",
  capitalMin: "", capitalMax: "",
});
const hasColFilters = computed(() => Object.values(colFilters.value).some((v) => v !== ""));
function resetColFilters() {
  colFilters.value = { search: "", disposition: "", turnsMin: "", turnsMax: "", marginMin: "", marginMax: "", capitalMin: "", capitalMax: "" };
}

const filteredTableRows = computed(() => {
  const f = colFilters.value;
  const q = f.search.trim().toLowerCase();
  return props.list.filter((s) => {
    if (q && !(s.binomial.toLowerCase().includes(q) || s.common.toLowerCase().includes(q) || s.part.toLowerCase().includes(q) || s.form.toLowerCase().includes(q))) return false;
    if (f.disposition && s.disposition !== f.disposition) return false;
    if (f.turnsMin !== "" && s.turns < f.turnsMin) return false;
    if (f.turnsMax !== "" && s.turns > f.turnsMax) return false;
    if (f.marginMin !== "" && s.marginPct * 100 < f.marginMin) return false;
    if (f.marginMax !== "" && s.marginPct * 100 > f.marginMax) return false;
    if (f.capitalMin !== "" && s.capital < f.capitalMin) return false;
    if (f.capitalMax !== "" && s.capital > f.capitalMax) return false;
    return true;
  });
});

const sortedTableRows = computed(() => {
  const key = sortKey.value;
  const dir = sortDir.value === "asc" ? 1 : -1;
  return [...filteredTableRows.value].sort((a, b) => {
    const av = key === "binomial" || key === "disposition" ? a[key] : key === "turns" ? a.turns : key === "marginPct" ? a.marginPct : a.capital;
    const bv = key === "binomial" || key === "disposition" ? b[key] : key === "turns" ? b.turns : key === "marginPct" ? b.marginPct : b.capital;
    if (typeof av === "string") return av.localeCompare(bv) * dir;
    return (av - bv) * dir;
  });
});

const tableRows = computed(() => sortedTableRows.value.slice(0, 60));
</script>

<template>
  <section class="section" id="section-quadrant">
    <div class="section-head">
      <div>
        <h2>Velocity × margin</h2>
        <div class="section-sub">Every SKU plotted by turns and margin. Click a point for full detail.</div>
      </div>
      <div class="view-toggle">
        <button :class="{ active: view === 'chart' }" @click="view = 'chart'">Chart</button>
        <button :class="{ active: view === 'table' }" @click="view = 'table'">Table</button>
      </div>
    </div>
    <div class="panel">
      <div class="quadrant-wrap" v-show="view === 'chart'">
        <div class="quadrant-chart-area" ref="wrapEl">
          <svg
            ref="svgEl"
            class="quadrant-svg"
            viewBox="0 0 720 480"
            role="img"
            aria-label="Scatter plot of every SKU positioned by inventory turns and margin percent, sized by capital tied up"
          >
            <line
              v-for="t in xTicks"
              :key="'gx' + t"
              class="quad-gridline"
              :x1="xScale(t)"
              :x2="xScale(t)"
              :y1="PAD.top"
              :y2="PAD.top + plotH"
            />
            <template v-for="m in yTicks" :key="'gy' + m">
              <line class="quad-gridline" :x1="PAD.left" :x2="PAD.left + plotW" :y1="yScale(m)" :y2="yScale(m)" />
              <text class="quad-axis-label" :x="PAD.left - 8" :y="yScale(m) + 4" text-anchor="end">
                {{ Math.round(m * 100) }}%
              </text>
            </template>
            <text v-for="t in xTicks" :key="'tx' + t" class="quad-axis-label" :x="xScale(t)" :y="PAD.top + plotH + 18" text-anchor="middle">
              {{ t }}x
            </text>

            <line class="quad-medianline" :x1="medX" :x2="medX" :y1="PAD.top" :y2="PAD.top + plotH" />
            <line class="quad-medianline" :x1="PAD.left" :x2="PAD.left + plotW" :y1="medY" :y2="medY" />

            <circle
              v-for="p in points"
              :key="p.s.id"
              class="sku-mark"
              :class="{ 'is-protected': p.s.protected, hovered: hovered && hovered.s.id === p.s.id }"
              :cx="p.cx"
              :cy="p.cy"
              :r="p.r"
            />

            <text v-for="c in corners" :key="c.label" class="quad-label" :x="c.x" :y="c.y" :text-anchor="c.anchor">
              {{ c.label }}
            </text>

            <text class="quad-axis-label" :x="PAD.left + plotW / 2" :y="CHART_H - 6" text-anchor="middle" style="font-weight: 700">
              Inventory turns (trailing 6mo, annualized) →
            </text>
            <text
              class="quad-axis-label"
              :x="-(PAD.top + plotH / 2)"
              y="16"
              text-anchor="middle"
              transform="rotate(-90)"
              style="font-weight: 700"
            >
              Margin % ↑
            </text>

            <rect
              class="sku-overlay"
              :x="PAD.left"
              :y="PAD.top"
              :width="plotW"
              :height="plotH"
              fill="transparent"
              @mousemove="onOverlayMove"
              @mouseleave="onOverlayLeave"
              @click="onOverlayClick"
            />
          </svg>
          <div class="chart-tooltip" :class="{ visible: hovered }" :style="tooltipStyle" v-if="hovered">
            <div class="tt-title">{{ hovered.s.binomial }}</div>
            <div class="tt-row">{{ hovered.s.common }} — {{ hovered.s.part }}, {{ hovered.s.form }}</div>
            <div class="tt-row">Turns {{ hovered.s.turns.toFixed(2) }}x · Margin {{ fmtPct(hovered.s.marginPct) }}</div>
            <div class="tt-row">Capital {{ fmtMoney(hovered.s.capital) }} · {{ hovered.s.disposition }}</div>
          </div>
        </div>
        <div class="quadrant-legend">
          <h4>Reading this chart</h4>
          <div class="legend-item"><span class="legend-swatch dot"></span> SKU (size = capital tied up)</div>
          <div class="legend-item"><span class="legend-swatch ring"></span> Protected — clinically necessary</div>
          <div class="legend-note">
            Position is the disposition: the crosshair sits at the assortment's median turns and median margin.
            Quadrant corners read <b>expand</b> (top-right), <b>hold</b> (bottom-right), <b>reduce</b> (top-left),
            <b>discontinue</b> (bottom-left).
          </div>
          <div class="legend-note">
            {{ counts.expand }} expand · {{ counts.hold }} hold · {{ counts.reduce }} reduce · {{ counts.discontinue }} discontinue in this view.
          </div>
        </div>
      </div>

      <div v-show="view === 'table'">
        <table class="data-table quadrant-table">
          <thead>
            <tr>
              <th class="sortable" :aria-sort="ariaSort('binomial')" tabindex="0" @click="setSort('binomial')" @keydown.enter="setSort('binomial')">
                SKU <span class="sort-arrow" :class="{ active: sortKey === 'binomial' }">{{ sortKey === "binomial" && sortDir === "asc" ? "▲" : "▼" }}</span>
              </th>
              <th class="sortable" :aria-sort="ariaSort('disposition')" tabindex="0" @click="setSort('disposition')" @keydown.enter="setSort('disposition')">
                Disposition <span class="sort-arrow" :class="{ active: sortKey === 'disposition' }">{{ sortKey === "disposition" && sortDir === "asc" ? "▲" : "▼" }}</span>
              </th>
              <th class="sortable num" :aria-sort="ariaSort('turns')" tabindex="0" @click="setSort('turns')" @keydown.enter="setSort('turns')">
                Turns <span class="sort-arrow" :class="{ active: sortKey === 'turns' }">{{ sortKey === "turns" && sortDir === "asc" ? "▲" : "▼" }}</span>
              </th>
              <th class="sortable num" :aria-sort="ariaSort('marginPct')" tabindex="0" @click="setSort('marginPct')" @keydown.enter="setSort('marginPct')">
                Margin <span class="sort-arrow" :class="{ active: sortKey === 'marginPct' }">{{ sortKey === "marginPct" && sortDir === "asc" ? "▲" : "▼" }}</span>
              </th>
              <th class="sortable num" :aria-sort="ariaSort('capital')" tabindex="0" @click="setSort('capital')" @keydown.enter="setSort('capital')">
                Capital <span class="sort-arrow" :class="{ active: sortKey === 'capital' }">{{ sortKey === "capital" && sortDir === "asc" ? "▲" : "▼" }}</span>
              </th>
            </tr>
            <tr class="col-filter-row">
              <th>
                <input type="text" class="col-filter-input" placeholder="Search…" v-model="colFilters.search" @click.stop />
              </th>
              <th>
                <select class="col-filter-select" v-model="colFilters.disposition" @click.stop>
                  <option value="">All</option>
                  <option value="expand">Expand</option>
                  <option value="hold">Hold</option>
                  <option value="reduce">Reduce</option>
                  <option value="discontinue">Discontinue</option>
                </select>
              </th>
              <th class="num">
                <div class="col-filter-range">
                  <input type="number" class="col-filter-input" placeholder="Min" v-model.number="colFilters.turnsMin" @click.stop />
                  <input type="number" class="col-filter-input" placeholder="Max" v-model.number="colFilters.turnsMax" @click.stop />
                </div>
              </th>
              <th class="num">
                <div class="col-filter-range">
                  <input type="number" class="col-filter-input" placeholder="Min %" v-model.number="colFilters.marginMin" @click.stop />
                  <input type="number" class="col-filter-input" placeholder="Max %" v-model.number="colFilters.marginMax" @click.stop />
                </div>
              </th>
              <th class="num">
                <div class="col-filter-range">
                  <input type="number" class="col-filter-input" placeholder="Min $" v-model.number="colFilters.capitalMin" @click.stop />
                  <input type="number" class="col-filter-input" placeholder="Max $" v-model.number="colFilters.capitalMax" @click.stop />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="tableRows.length === 0">
              <td colspan="5" class="empty-note">No SKUs match the current filters.</td>
            </tr>
            <tr v-for="s in tableRows" :key="s.id" class="clickable" @click="$emit('open-drawer', s.id)">
              <td><span class="binomial">{{ s.binomial }}</span><span class="common">{{ s.part }}, {{ s.form }}</span></td>
              <td>{{ s.disposition }}</td>
              <td class="num">{{ s.turns.toFixed(2) }}x</td>
              <td class="num">{{ fmtPct(s.marginPct) }}</td>
              <td class="num">{{ fmtMoney(s.capital) }}</td>
            </tr>
          </tbody>
        </table>
        <div class="action-more table-note">
          <span v-if="filteredTableRows.length > 60">
            Showing 60 of {{ filteredTableRows.length }} matching SKUs (of {{ list.length }} in view).
          </span>
          <span v-else>{{ filteredTableRows.length }} of {{ list.length }} SKUs in view.</span>
          <a v-if="hasColFilters" href="#" class="clear-col-filters" @click.prevent="resetColFilters">Clear column filters</a>
        </div>
      </div>
    </div>
  </section>
</template>
