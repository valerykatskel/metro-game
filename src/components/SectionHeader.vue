<template>
  <section class="section-header">
    <div v-if="showProp(sectionLabel)" class="section-label">
      {{ sectionLabel }}
    </div>
    <h2 v-if="showProp(sectionHeader)">{{ sectionHeader }}</h2>
    <div
      v-if="showProp(sectionMeta)"
      class="section-meta"
      v-html="sectionMeta"
    ></div>
    <div
      v-if="showProp(sectionDescription)"
      class="description"
      v-html="sectionDescription"
    ></div>
  </section>
</template>

<script>
export default {
  name: "SectionHeader",
  props: {
    sectionLabel: String,
    sectionHeader: String,
    sectionMeta: String,
    sectionDescription: String
  },
  methods: {
    showProp(prop) {
      return prop !== undefined && prop.trim().length > 0;
    }
  }
};
</script>

<style lang="scss"></style>
