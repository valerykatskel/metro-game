<template>
  <l-map
    ref="map"
    :zoom="zoom"
    :min-zoom="minZoom"
    :max-zoom="maxZoom"
    :zoomAnimation="true"
    :options="mapOptions"
    :bounds="bounds"
    :max-bounds="maxBounds"
    style="height: 100%; width: 100%;"
    @click="onMapClick"
  >
    <l-tile-layer
      :name="tileProvider.name"
      :url="tileProvider.url"
      layer-type="base"
    />

    <l-control position="topleft">
      <div class="stations-count">
        <span v-if="userStationsLeft > 0">
          Еще можно поставить точек
          <span class="label">{{ userStationsLeft }}</span>
        </span>
        <span v-else>Точек не осталось</span>
      </div>
    </l-control>

    <l-control-zoom position="bottomright" />

    <l-layer-group
      v-for="item in metroData"
      :key="item.id"
      :visible.sync="item.visible"
      layer-type="overlay"
      :name="item.name"
    >
      <l-layer-group :visible="item.markersVisible">
        <l-circle-marker
          v-for="marker in item.markers"
          :key="marker.id"
          :lat-lng="marker.position"
          :visible="marker.visible"
          :color="item.markersColor"
          fillColor="#fff"
          :fillOpacity="1.0"
          :weight="4"
          :radius="8"
        >
          <l-tooltip :content="marker.tooltip" />
        </l-circle-marker>
      </l-layer-group>
      <l-polyline
        :lat-lngs="item.polyline.points"
        :visible="item.polyline.visible"
        :color="item.polyline.color"
        :weight="6"
        class="metro-line"
      />
    </l-layer-group>

    <l-layer-group>
      <l-marker
        v-for="marker in markers"
        :key="marker.id"
        :visible="marker.visible"
        :draggable="marker.draggable"
        :lat-lng.sync="marker.position"
      >
        <l-icon
          :icon-size="dynamicSize"
          :icon-anchor="dynamicAnchor"
          :icon-url="marker.icon"
          :icon-retina-url="marker.icon2x"
          :className="marker.className"
        >
          <span>{{ marker.id }}</span>
        </l-icon>
      </l-marker>
      <l-polyline
        v-if="markersLine.length > 1"
        :lat-lngs="markersLine"
        :weight="6"
        color="#84B132"
        class="user-line"
      />
    </l-layer-group>
  </l-map>
</template>

<script>
export default {
  name: "MapWrapper",
  components: {}
};
</script>

<style lang="scss"></style>
