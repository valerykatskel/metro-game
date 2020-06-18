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
    font-size: 13px;
    line-height: 18px;
    text-align: left;
    margin-bottom: 10px;
  }
  .section-meta {
    text-align: left;
    p {
      margin: 0;
      color: #808080;
      font-size: 13px;
      line-height: 18px;
    }
  }

  .description {
    p {
      margin-bottom: 0;
      margin-top: 15px;
      font-size: 15px;
      line-height: 23px;
      text-align: left;
    }
  }
  h2 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 21px;
    line-height: 27px;
    text-align: left;
  }
}

@media (min-width: 481px) {
  .section-header {
    .section-label {
      text-align: center;
    }
    h2 {
      text-align: center;
      font-size: 35px;
      line-height: 41px;
      margin-bottom: 20px;
    }
    .section-meta {
      text-align: center;
    }
    .description {
      p {
        text-align: center;
        font-size: 17px;
        line-height: 25px;
        margin-top: 20px;
      }
    }
  }
}
</style>
