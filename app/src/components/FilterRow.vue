<script setup>
defineProps({
  formOptions: { type: Array, required: true },
  traditionOptions: { type: Array, required: true },
  dispositionOptions: { type: Array, required: true },
  filterNote: { type: String, required: true },
  form: { type: String, required: true },
  tradition: { type: String, required: true },
  disposition: { type: String, required: true },
});
defineEmits(["update:form", "update:tradition", "update:disposition", "reset"]);
</script>

<template>
  <div class="filter-row">
    <div class="filter-group">
      <label for="f-form">Form</label>
      <select id="f-form" :value="form" @change="$emit('update:form', $event.target.value)">
        <option value="">All forms</option>
        <option v-for="f in formOptions" :key="f" :value="f">{{ f }}</option>
      </select>
    </div>
    <div class="filter-group">
      <label for="f-tradition">Tradition</label>
      <select id="f-tradition" :value="tradition" @change="$emit('update:tradition', $event.target.value)">
        <option value="">All traditions</option>
        <option v-for="t in traditionOptions" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>
    <div class="filter-group">
      <label for="f-disposition">Disposition</label>
      <select id="f-disposition" :value="disposition" @change="$emit('update:disposition', $event.target.value)">
        <option value="">All dispositions</option>
        <option v-for="d in dispositionOptions" :key="d" :value="d">{{ d[0].toUpperCase() + d.slice(1) }}</option>
      </select>
    </div>
    <div class="spacer"></div>
    <span class="active-note">{{ filterNote }}</span>
    <button class="reset-btn" @click="$emit('reset')">Reset</button>
  </div>
</template>
