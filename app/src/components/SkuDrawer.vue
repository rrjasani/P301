<script setup>
import { fmtMoney, fmtMoneyPrecise, fmtPct, fmtDate } from "../format.js";

defineProps({
  sku: { type: Object, default: null },
  siblings: { type: Array, default: () => [] },
});
defineEmits(["close", "open-drawer"]);

const dispositionCopy = {
  expand: "Above-median turns and margin — earning its place; consider growing it.",
  hold: "Moving well but margin trails the assortment — fine as-is, not a growth bet.",
  reduce: "Healthy margin but slow to turn — shrink the position, don't add more.",
  discontinue: "Below-median on both counts. The default read is cut, unless protected.",
};
</script>

<template>
  <div class="drawer-backdrop" :class="{ open: !!sku }" @click="$emit('close')"></div>
  <aside class="drawer" :class="{ open: !!sku }" :aria-hidden="!sku">
    <template v-if="sku">
      <div class="drawer-head">
        <button class="drawer-close" aria-label="Close" @click="$emit('close')">×</button>
        <div class="binomial">{{ sku.binomial }}</div>
        <div class="common">{{ sku.common }} — {{ sku.tradition }} tradition</div>
        <div class="sku-tag">{{ sku.id }} · {{ sku.part }} · {{ sku.form }}</div>
      </div>
      <div class="drawer-body">
        <div class="disposition-banner" :class="'disp-' + sku.disposition">
          {{ sku.disposition.toUpperCase() }}<span v-if="sku.protected"> · PROTECTED</span>
        </div>
        <div class="drawer-section">
          <p style="margin: 0 0 12px; font-size: 13px; color: var(--gray-body)">{{ dispositionCopy[sku.disposition] }}</p>
          <div class="drawer-stat-grid">
            <div class="drawer-stat"><div class="val">{{ fmtMoney(sku.capital) }}</div><div class="lbl">Capital tied up</div></div>
            <div class="drawer-stat"><div class="val">{{ sku.onHand }} {{ sku.uom }}</div><div class="lbl">On hand</div></div>
            <div class="drawer-stat"><div class="val">{{ sku.turns.toFixed(2) }}x</div><div class="lbl">Inventory turns</div></div>
            <div class="drawer-stat"><div class="val">{{ fmtPct(sku.marginPct) }}</div><div class="lbl">Margin %</div></div>
            <div class="drawer-stat"><div class="val">{{ fmtMoney(sku.marginDollars) }}</div><div class="lbl">Margin $</div></div>
            <div class="drawer-stat"><div class="val">{{ fmtMoney(sku.revenue) }}</div><div class="lbl">Revenue (6mo)</div></div>
            <div class="drawer-stat"><div class="val">{{ fmtMoneyPrecise(sku.price) }}</div><div class="lbl">Price / {{ sku.uom }}</div></div>
            <div class="drawer-stat"><div class="val">{{ fmtMoneyPrecise(sku.unitCost) }}</div><div class="lbl">Cost / {{ sku.uom }}</div></div>
            <div class="drawer-stat"><div class="val">{{ sku.practitionerCount }}</div><div class="lbl">Practitioners</div></div>
            <div class="drawer-stat"><div class="val">{{ sku.lastDispensed ? fmtDate(sku.lastDispensed) : "Never" }}</div><div class="lbl">Last dispensed</div></div>
            <div class="drawer-stat"><div class="val">{{ sku.supplier }}</div><div class="lbl">Supplier ({{ sku.supplierDomestic ? "domestic" : "import" }})</div></div>
            <div class="drawer-stat"><div class="val">{{ sku.supplierLeadDays }}d</div><div class="lbl">Lead time</div></div>
          </div>
        </div>

        <div v-if="sku.clinicalNote" class="drawer-section">
          <h4>Clinical note</h4>
          <div class="clinical-note">{{ sku.clinicalNote }}</div>
        </div>

        <div v-if="siblings.length" class="drawer-section">
          <h4>Other forms of this herb</h4>
          <table class="mini-table">
            <thead><tr><th>Part / form</th><th class="num">Turns</th><th class="num">Margin</th><th class="num">Capital</th></tr></thead>
            <tbody>
              <tr v-for="sib in siblings" :key="sib.id" style="cursor: pointer" @click="$emit('open-drawer', sib.id)">
                <td>{{ sib.part }}, {{ sib.form }}</td>
                <td class="num">{{ sib.turns.toFixed(2) }}x</td>
                <td class="num">{{ fmtPct(sib.marginPct) }}</td>
                <td class="num">{{ fmtMoney(sib.capital) }}</td>
              </tr>
            </tbody>
          </table>
          <p style="font-size: 11.5px; color: var(--ink-muted); margin-top: 6px">
            If one form is carrying the herb and another isn't, the fix may be dropping a form — not the herb.
          </p>
        </div>

        <div class="drawer-section">
          <h4>Lots on hand</h4>
          <table v-if="sku.lots.length" class="mini-table">
            <thead><tr><th>Lot</th><th>Supplier</th><th>Received</th><th>Expiry</th><th class="num">Qty</th></tr></thead>
            <tbody>
              <tr v-for="l in sku.lots" :key="l.id">
                <td>{{ l.id }}</td>
                <td>{{ l.supplier }}</td>
                <td>{{ fmtDate(l.received) }}</td>
                <td :style="l.daysToExpiry <= 90 ? 'color:var(--rust);font-weight:700;' : ''">
                  {{ fmtDate(l.expiry) }}<span v-if="l.daysToExpiry < 0"> (expired)</span>
                </td>
                <td class="num">{{ l.qty }} {{ sku.uom }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-note">No lots on hand.</div>
        </div>

        <div class="drawer-section">
          <h4>Recent orders</h4>
          <table v-if="sku.orderLines.length" class="mini-table">
            <thead><tr><th>Order</th><th>Date</th><th>Practitioner</th><th class="num">Qty</th><th>Lot</th></tr></thead>
            <tbody>
              <tr v-for="o in sku.orderLines" :key="o.id">
                <td>{{ o.id }}</td>
                <td>{{ fmtDate(o.date) }}</td>
                <td>{{ o.practitioner }}</td>
                <td class="num">{{ o.qty }} {{ sku.uom }}</td>
                <td>{{ o.lot }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-note">No orders in the trailing window.</div>
        </div>
      </div>
    </template>
  </aside>
</template>
