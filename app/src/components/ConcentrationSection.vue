<script setup>
import { computed } from "vue";
import { fmtMoney } from "../format.js";

const props = defineProps({ list: { type: Array, required: true } });
defineEmits(["open-drawer"]);

const rows = computed(() => props.list.filter((s) => s.concentrated).sort((a, b) => b.revenue - a.revenue).slice(0, 20));
function share(s) {
  return Math.round(100 / s.practitionerCount);
}
</script>

<template>
  <section class="section" id="section-concentration">
    <div class="section-head">
      <div>
        <h2>Concentration risk</h2>
        <div class="section-sub">High revenue riding on one or two practitioners — not a success, an exposure.</div>
      </div>
    </div>
    <div class="panel">
      <table class="data-table">
        <thead>
          <tr><th>SKU</th><th class="num">Revenue</th><th>Practitioners</th><th>Share carried by top practitioner</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-if="rows.length === 0"><td colspan="4" class="empty-note">No concentration risk in the current filter.</td></tr>
          <tr v-for="s in rows" :key="s.id" class="clickable" @click="$emit('open-drawer', s.id)">
            <td><span class="binomial">{{ s.binomial }}</span><span class="common">{{ s.part }}, {{ s.form }}</span></td>
            <td class="num">{{ fmtMoney(s.revenue) }}</td>
            <td>{{ s.practitionerCount }}</td>
            <td>
              <div class="concentration-bar-track"><div class="concentration-bar-fill" :style="{ width: share(s) + '%' }"></div></div>
              <span style="font-size: 11px; color: var(--ink-muted)">~{{ share(s) }}% from one</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
