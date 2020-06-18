<template>
  <div class="stations-count">
    <span v-if="count > 0">
      Еще можно поставить точек
      <span class="label">{{ count }}</span>
    </span>
    <span v-else>Точек не осталось</span>
  </div>
</template>

<script>
export default {
  name: "UserStationsInfo",
  props: {
    count: Number
  }
};
</script>

<style lang="scss">
.stations-count {
  margin: 5px 0 0 5px;
  background: #fff;
  border-radius: 3px;
  height: 35px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  color: #1d1d1f;
  font-size: 13px;
  font-family: Arial, Helvetica, sans-serif;
  .label {
    display: inline-block;
    border-radius: 50%;
    margin-left: 10px;
    width: 25px;
    height: 25px;
    font-size: 13px;
    display: inline-block;
    background: #84b132;
    color: #fff;
    line-height: 25px;
  }
}
</style>
