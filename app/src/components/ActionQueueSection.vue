<script setup>
import { computed } from "vue";
import { fmtMoney } from "../format.js";

const props = defineProps({
  list: { type: Array, required: true },
  requests: { type: Array, required: true },
});
defineEmits(["open-drawer"]);

const groups = computed(() => {
  const list = props.list;
  const discontinue = list.filter((s) => s.disposition === "discontinue" && s.units > 0).sort((a, b) => b.impact.value - a.impact.value);
  const reduce = list.filter((s) => s.disposition === "reduce").sort((a, b) => b.impact.value - a.impact.value);
  const expand = list.filter((s) => s.disposition === "expand").sort((a, b) => b.impact.value - a.impact.value);
  const reprice = list.filter((s) => s.repriceCandidate).sort((a, b) => b.repriceUpside - a.repriceUpside);
  const deadNow = list.filter((s) => s.dead).sort((a, b) => b.capital - a.capital);
  const addCandidates = [...props.requests].sort((a, b) => b.times - a.times);

  return [
    {
      title: "Discontinue", tone: "critical", items: discontinue,
      impactLabel: "Capital freed", impactValue: discontinue.reduce((a, s) => a + s.impact.value, 0),
      render: (s) => `${fmtMoney(s.impact.value)} freed`,
    },
    {
      title: "Reduce", tone: "warning", items: reduce,
      impactLabel: "Capital freed", impactValue: reduce.reduce((a, s) => a + s.impact.value, 0),
      render: (s) => `${fmtMoney(s.impact.value)} freed`,
    },
    {
      title: "Expand", tone: "good", items: expand,
      impactLabel: "Margin gained", impactValue: expand.reduce((a, s) => a + s.impact.value, 0),
      render: (s) => `+${fmtMoney(s.impact.value)}`,
    },
    {
      title: "Reprice", tone: "warning", items: reprice,
      impactLabel: "Margin upside", impactValue: reprice.reduce((a, s) => a + s.repriceUpside, 0),
      render: (s) => `+${fmtMoney(s.repriceUpside)}`,
    },
    {
      title: "Dead stock now", tone: "critical", items: deadNow,
      impactLabel: "Capital freed", impactValue: deadNow.reduce((a, s) => a + s.capital, 0),
      render: (s) => `${fmtMoney(s.capital)} freed`,
    },
    {
      title: "Add candidates", tone: "info", items: addCandidates,
      impactLabel: "Projected margin", impactValue: addCandidates.reduce((a, r) => a + r.projectedMargin, 0),
      render: (r) => `+${fmtMoney(r.projectedMargin)} est.`,
      isRequest: true,
    },
  ];
});
</script>

<template>
  <section class="section" id="section-actions">
    <div class="section-head">
      <div>
        <h2>Action queue</h2>
        <div class="section-sub">Every recommendation carries a dollar figure.</div>
      </div>
    </div>
    <div class="action-groups">
      <div v-for="g in groups" :key="g.title" class="action-group" :data-tone="g.tone">
        <div class="action-group-head">
          <span class="action-dot" :class="g.tone"></span>
          <span class="action-group-title">{{ g.title }}</span>
          <span class="action-group-count">{{ g.items.length }}</span>
        </div>
        <div class="action-group-impact">
          <span class="impact-label">{{ g.impactLabel }}</span>
          {{ fmtMoney(g.impactValue) }}
        </div>
        <div v-if="g.items.length === 0" class="empty-note">Nothing in this bucket for the current filter.</div>
        <template v-else>
          <ul class="action-list">
            <li
              v-for="it in g.items.slice(0, 5)"
              :key="it.id"
              :class="{ 'not-clickable': g.isRequest }"
              :title="g.isRequest ? 'See the Add candidates section below for full detail' : null"
              @click="!g.isRequest && $emit('open-drawer', it.id)"
            >
              <span class="al-name">
                {{ it.common }}
                <span v-if="!g.isRequest" style="font-style: normal; color: var(--ink-muted)">({{ it.part }})</span>
              </span>
              <span class="al-value">{{ g.render(it) }}</span>
            </li>
          </ul>
          <div v-if="g.items.length > 5" class="action-more">+{{ g.items.length - 5 }} more</div>
        </template>
      </div>
    </div>
  </section>
</template>
