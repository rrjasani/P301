<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { APOTHECARY } from "./data.js";
import { fmtDate } from "./format.js";
import FilterRow from "./components/FilterRow.vue";
import KpiRow from "./components/KpiRow.vue";
import QuadrantSection from "./components/QuadrantSection.vue";
import ActionQueueSection from "./components/ActionQueueSection.vue";
import DeadStockSection from "./components/DeadStockSection.vue";
import ConcentrationSection from "./components/ConcentrationSection.vue";
import CandidatesSection from "./components/CandidatesSection.vue";
import SkuDrawer from "./components/SkuDrawer.vue";

const { meta, skus, requests, stockouts } = APOTHECARY;

const asOfLabel = `As of ${fmtDate(meta.asOf)} · trailing ${meta.windowDays} days`;

/* ---------- filter state — one row, scopes every section below it ---------- */
const filters = ref({ form: "", tradition: "", disposition: "" });

const uniqueSorted = (arr) => [...new Set(arr)].sort((a, b) => a.localeCompare(b));
const formOptions = uniqueSorted(skus.map((s) => s.form));
const traditionOptions = uniqueSorted(skus.map((s) => s.tradition));
const dispositionOptions = ["expand", "hold", "reduce", "discontinue"];

const filteredSkus = computed(() =>
  skus.filter(
    (s) =>
      (!filters.value.form || s.form === filters.value.form) &&
      (!filters.value.tradition || s.tradition === filters.value.tradition) &&
      (!filters.value.disposition || s.disposition === filters.value.disposition)
  )
);

const filterNote = computed(() => {
  const parts = [];
  if (filters.value.form) parts.push(filters.value.form);
  if (filters.value.tradition) parts.push(filters.value.tradition);
  if (filters.value.disposition) parts.push(filters.value.disposition);
  return parts.length
    ? `${filteredSkus.value.length} of ${skus.length} SKUs — ${parts.join(" · ")}`
    : `${filteredSkus.value.length} SKUs`;
});

function resetFilters() {
  filters.value = { form: "", tradition: "", disposition: "" };
}

/* ---------- SKU detail drawer — R9 drill-down, R6 form comparison ---------- */
const selectedSkuId = ref(null);
const selectedSku = computed(() => skus.find((s) => s.id === selectedSkuId.value) || null);
const siblingSkus = computed(() =>
  selectedSku.value ? skus.filter((s) => s.herbId === selectedSku.value.herbId && s.id !== selectedSku.value.id) : []
);
function openDrawer(id) {
  selectedSkuId.value = id;
}
function closeDrawer() {
  selectedSkuId.value = null;
}
function onKeydown(e) {
  if (e.key === "Escape") closeDrawer();
}
onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <nav class="app-nav">
    <div class="brand">Groundwork <span>Apothecary</span></div>
    <div class="as-of">{{ asOfLabel }}</div>
  </nav>

  <div class="shell">
    <header class="page-head">
      <h1>Is what I carry worth carrying?</h1>
      <div class="persona-line">Maya Okonkwo, Owner/Operator<small>Assortment review — trailing 6 months</small></div>
    </header>

    <FilterRow
      v-model:form="filters.form"
      v-model:tradition="filters.tradition"
      v-model:disposition="filters.disposition"
      :form-options="formOptions"
      :tradition-options="traditionOptions"
      :disposition-options="dispositionOptions"
      :filter-note="filterNote"
      @reset="resetFilters"
    />

    <section class="section">
      <KpiRow :list="filteredSkus" :meta="meta" />
    </section>

    <QuadrantSection :list="filteredSkus" :all-skus="skus" :meta="meta" @open-drawer="openDrawer" />
    <ActionQueueSection :list="filteredSkus" :requests="requests" @open-drawer="openDrawer" />
    <DeadStockSection :list="filteredSkus" @open-drawer="openDrawer" />
    <ConcentrationSection :list="filteredSkus" @open-drawer="openDrawer" />
    <CandidatesSection :requests="requests" :stockouts="stockouts" @open-drawer="openDrawer" />
  </div>

  <SkuDrawer :sku="selectedSku" :siblings="siblingSkus" @close="closeDrawer" @open-drawer="openDrawer" />
</template>
