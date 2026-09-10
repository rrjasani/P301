<script setup>
import { computed } from "vue";
import { fmtMoney } from "../format.js";

const props = defineProps({ list: { type: Array, required: true } });
defineEmits(["open-drawer"]);

const dead = computed(() => props.list.filter((s) => s.dead).sort((a, b) => b.capital - a.capital));
const totalCapital = computed(() => dead.value.reduce((a, s) => a + s.capital, 0));
const totalExp90 = computed(() => dead.value.reduce((a, s) => a + s.expiring90, 0));
const rows = computed(() => dead.value.slice(0, 25));

function expiryTier(s) {
  const expired = s.lots.filter((l) => l.daysToExpiry < 0).reduce((a, l) => a + l.qty * l.unitCost, 0);
  if (expired > 0) return { level: "expired", value: expired };
  if (s.expiring30 > 0) return { level: "30", value: s.expiring30 };
  if (s.expiring60 > 0) return { level: "60", value: s.expiring60 };
  if (s.expiring90 > 0) return { level: "90", value: s.expiring90 };
  return { level: "none", value: 0 };
}
</script>

<template>
  <section class="section" id="section-deadstock">
    <div class="section-head">
      <div>
        <h2>Dead stock &amp; expiry exposure</h2>
        <div class="section-sub">No movement in the trailing window. This is money currently evaporating.</div>
      </div>
    </div>
    <div class="panel">
      <div class="stat-mini">
        <div class="mini-item"><div class="mini-value">{{ dead.length }}</div><div class="mini-label">SKUs, no movement</div></div>
        <div class="mini-item"><div class="mini-value">{{ fmtMoney(totalCapital) }}</div><div class="mini-label">capital tied up</div></div>
        <div class="mini-item"><div class="mini-value">{{ fmtMoney(totalExp90) }}</div><div class="mini-label">of it expires within 90 days</div></div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>SKU</th><th>Form</th><th class="num">Capital tied up</th><th class="num">Days since dispensed</th><th>Expiry exposure</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="dead.length === 0"><td colspan="6" class="empty-note">No dead stock in the current filter.</td></tr>
          <tr v-for="s in rows" :key="s.id" class="clickable" @click="$emit('open-drawer', s.id)">
            <td><span class="binomial">{{ s.binomial }}</span><span class="common">{{ s.common }}</span></td>
            <td>{{ s.part }}, {{ s.form }}</td>
            <td class="num">{{ fmtMoney(s.capital) }}</td>
            <td class="num">{{ s.daysSinceDispensed }}</td>
            <td>
              <span v-if="expiryTier(s).level === 'expired'" class="expiry-chip" style="background: var(--expiry-700)">
                <span class="chip-icon">⚠</span>{{ fmtMoney(expiryTier(s).value) }} already expired
              </span>
              <span v-else-if="expiryTier(s).level === '30'" class="expiry-chip" style="background: var(--expiry-700)">
                <span class="chip-icon">⚠</span>{{ fmtMoney(expiryTier(s).value) }} in ≤30d
              </span>
              <span v-else-if="expiryTier(s).level === '60'" class="expiry-chip" style="background: var(--expiry-400)">
                {{ fmtMoney(expiryTier(s).value) }} in ≤60d
              </span>
              <span v-else-if="expiryTier(s).level === '90'" class="expiry-chip" style="background: var(--expiry-100); color: var(--bark-brown)">
                {{ fmtMoney(expiryTier(s).value) }} in ≤90d
              </span>
              <span v-else style="color: var(--ink-muted); font-size: 12px">no near-term expiry</span>
            </td>
            <td><span v-if="s.protected" class="protected-badge">Protected</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
