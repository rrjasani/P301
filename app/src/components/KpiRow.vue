<script setup>
import { computed } from "vue";
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
    { label: "Total SKUs", value: list.length.toLocaleString(), sub: `${m.herbCount} herbs in the catalog` },
    { label: "Capital tied up", value: fmtMoney(capital), sub: "on-hand inventory at cost" },
    {
      label: "Non-moving capital",
      value: fmtPct(deadShare),
      sub: `${fmtMoney(deadCapital)} across ${dead.length} SKUs`,
      tone: deadShare > 0.06 ? "critical" : deadShare > 0.03 ? "warn" : "",
    },
    { label: "Blended margin", value: fmtPct(margin), sub: `median ${fmtPct(m.medianMargin)}` },
    { label: "Inventory turns", value: turns.toFixed(2) + "x", sub: `median ${m.medianTurns.toFixed(2)}x` },
  ];
});
</script>

<template>
  <div class="kpi-row">
    <div
      v-for="t in tiles"
      :key="t.label"
      class="kpi-tile"
      :class="{ 'tile-critical': t.tone === 'critical', 'tile-warn': t.tone === 'warn' }"
    >
      <div class="kpi-label">{{ t.label }}</div>
      <div class="kpi-value">{{ t.value }}</div>
      <div class="kpi-sub">{{ t.sub }}</div>
    </div>
  </div>
</template>
