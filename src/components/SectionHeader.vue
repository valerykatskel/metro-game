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

<style lang="scss">
.section-header {
  text-align: left;
  margin-bottom: 25px;

  .section-label {
    color: #808080;
  }
  .section-meta {
    p {
      margin: 0;
      color: #808080;
      font-size: 12px;
      line-height: 17px;
    }
  }

  .description {
    p {
      margin-bottom: 0;
      margin-top: 20px;
      font-size: 17px;
      line-height: 25px;
    }
  }
  h2 {
    margin-top: 0;
    margin-bottom: 14px;
    font-size: 35px;
    line-height: 41px;
  }
}
</style>
