<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { fmtMoney, fmtPct } from "../format.js";

const props = defineProps({
  list: { type: Array, required: true },
  meta: { type: Object, required: true },
});

const tiles = computed(() => {
  const list = props.list;
  const m = props.meta;
  const capital = list.reduce((a, s) => a + s.capital, 0);
  const dead = list.filter((s) => s.dead);
  const deadCapital = dead.reduce((a, s) => a + s.capital, 0);
  const revenue = list.reduce((a, s) => a + s.revenue, 0);
  const cogs = list.reduce((a, s) => a + s.cogs, 0);
  const margin = revenue > 0 ? (revenue - cogs) / revenue : 0;
  const turns = capital > 0 ? (cogs * (365 / m.windowDays)) / capital : 0;
  const deadShare = capital > 0 ? deadCapital / capital : 0;

  return [
    {
      label: "Total SKUs", value: list.length.toLocaleString(), sub: `${m.herbCount} herbs in the catalog`,
      info: "Every distinct herb × plant-part × preparation-form combination currently on the shelf. Treat it as a baseline, not a target — the quadrant and action queue below tell you which of these SKUs are actually earning their space.",
    },
    {
      label: "Capital tied up", value: fmtMoney(capital), sub: "on-hand inventory at cost",
      info: "Total inventory cost currently sitting on the shelf, valued at what you paid — not what it will sell for. It's money you can't spend elsewhere until it's dispensed, so weigh it against the action queue's \"capital freed\" recommendations.",
    },
    {
      label: "Non-moving capital",
      value: fmtPct(deadShare),
      sub: `${fmtMoney(deadCapital)} across ${dead.length} SKUs`,
      tone: deadShare > 0.06 ? "critical" : deadShare > 0.03 ? "warn" : "",
      info: "Share of capital tied up in SKUs with zero movement in the trailing window. This is money quietly evaporating — expiry risk only grows the longer it sits, so anything above roughly 5–6% is worth a look in Dead stock below.",
    },
    {
      label: "Blended margin", value: fmtPct(margin), sub: `median ${fmtPct(m.medianMargin)}`,
      info: "Revenue-weighted margin percentage across every SKU in view. Compare it to the median beside it — a blended margin below the median means your highest-revenue SKUs are underpriced relative to the rest of the assortment.",
    },
    {
      label: "Inventory turns", value: turns.toFixed(2) + "x", sub: `median ${m.medianTurns.toFixed(2)}x`,
      info: "How many times inventory would cycle in a year at the current sales rate, annualized from the trailing window. Higher means capital recycles faster — SKUs below the median turns rate are the ones the quadrant flags to reduce or discontinue.",
    },
  ];
});

const openIndex = ref(null);
function toggle(i) {
  openIndex.value = openIndex.value === i ? null : i;
}
function closePopover() {
  openIndex.value = null;
}
function onKeydown(e) {
  if (e.key === "Escape") closePopover();
}
onMounted(() => {
  document.addEventListener("click", closePopover);
  document.addEventListener("keydown", onKeydown);
});
onUnmounted(() => {
  document.removeEventListener("click", closePopover);
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div class="kpi-row">
    <div
      v-for="(t, i) in tiles"
      :key="t.label"
      class="kpi-tile"
      :class="{ 'tile-critical': t.tone === 'critical', 'tile-warn': t.tone === 'warn' }"
    >
      <button
        class="kpi-info-btn"
        type="button"
        aria-haspopup="true"
        :aria-expanded="openIndex === i"
        :aria-label="`About ${t.label}`"
        @click.stop="toggle(i)"
      >
        i
      </button>
      <div class="kpi-label">{{ t.label }}</div>
      <div class="kpi-value">{{ t.value }}</div>
      <div class="kpi-sub">{{ t.sub }}</div>
      <div v-if="openIndex === i" class="kpi-popover" role="dialog" :aria-label="`About ${t.label}`" @click.stop>
        <div class="kpi-popover-title">{{ t.label }}</div>
        <p>{{ t.info }}</p>
      </div>
    </div>
  </div>
</template>
