<script setup>
import { computed } from "vue";
import { fmtMoney, fmtDate } from "../format.js";

const props = defineProps({
  requests: { type: Array, required: true },
  stockouts: { type: Array, required: true },
});
defineEmits(["open-drawer"]);

// Unaffected by SKU filters — requests aren't SKUs, so this list is stable
// regardless of the form/tradition/disposition filter above.
const sorted = computed(() => [...props.requests].sort((a, b) => b.times - a.times));
</script>

<template>
  <section class="section" id="section-candidates">
    <div class="section-head">
      <div>
        <h2>Add candidates</h2>
        <div class="section-sub">Unmet demand from requests (J5) and stockouts that blocked an order.</div>
      </div>
    </div>
    <div class="panel-grid-2">
      <div class="panel">
        <h3 style="font-size: 14px; color: var(--bark-brown); margin-bottom: 10px">Requested, not carried</h3>
        <div>
          <div v-for="r in sorted" :key="r.id" class="candidate-card">
            <div class="candidate-head">
              <span><span class="binomial">{{ r.binomial }}</span><span class="common"> {{ r.common }}</span></span>
              <span style="font-size: 11px; color: var(--ink-muted)">{{ r.tradition }}</span>
            </div>
            <div class="candidate-meta">
              Requested {{ r.times }}× by {{ r.practitioners }} practitioner{{ r.practitioners === 1 ? "" : "s" }} · last {{ fmtDate(r.lastRequested) }}
            </div>
            <div class="candidate-why">{{ r.why }}</div>
            <div class="candidate-stats">
              <span>Projected revenue <b>{{ fmtMoney(r.projectedRevenue) }}</b></span>
              <span>Projected margin <b>{{ fmtMoney(r.projectedMargin) }}</b></span>
            </div>
          </div>
        </div>
      </div>
      <div class="panel">
        <h3 style="font-size: 14px; color: var(--bark-brown); margin-bottom: 10px">Stockouts that blocked an order</h3>
        <table class="data-table">
          <thead><tr><th>SKU</th><th class="num">Revenue lost</th><th>Supplier lead</th></tr></thead>
          <tbody>
            <tr v-for="s in stockouts" :key="s.skuId" class="clickable" @click="$emit('open-drawer', s.skuId)">
              <td><span class="binomial">{{ s.binomial }}</span><span class="common">{{ s.label }}</span></td>
              <td class="num">{{ fmtMoney(s.revenueLost) }}</td>
              <td>{{ s.supplier }}, {{ s.leadDays }}d</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
