<template>
  <div>
    {{ getStations1Line }}
    <hr />
    {{ get1LineCoords }}
    <div>
      <button v-if="userStationsLeft > 0" name="button" @click="addMarker">
        Добавить станцию метро (осталось {{ userStationsLeft }})
      </button>
      <button v-if="userStationAdded > 0" name="button" @click="removeLast">
        Удалить последнюю
      </button>
      <button v-if="userStationAdded > 0" name="button" @click="removeAll">
        Удалить все
      </button>
      <button v-if="userStationAdded >= 4" name="button" @click="showResults">
        Готово
      </button>
      <hr />
      <table id="metro-lines-settings">
        <tr>
          <th>Линии метро</th>
          <th>Показать станции</th>
          <th>Показать линию</th>
        </tr>
        <tr v-for="(item, index) in metroData" :key="index">
          <td>{{ item.name }}</td>
          <td style="text-align: center">
            <input v-model="item.markersVisible" type="checkbox" />
          </td>
          <td style="text-align: center">
            <input v-model="item.polyline.visible" type="checkbox" />
          </td>
        </tr>
      </table>
    </div>
    <l-map
      ref="map"
      :zoom.sync="zoom"
      :options="mapOptions"
      :center="center"
      :min-zoom="minZoom"
      :max-zoom="maxZoom"
      style="height: 500px; width: 100%"
    >
      <l-control-layers
        :position="layersPosition"
        :collapsed="false"
        :sort-layers="true"
      />
      <l-tile-layer
        v-for="tileProvider in tileProviders"
        :key="tileProvider.name"
        :name="tileProvider.name"
        :visible="tileProvider.visible"
        :url="tileProvider.url"
        :attribution="tileProvider.attribution"
        :token="token"
        layer-type="base"
      />
      <l-control-zoom :position="zoomPosition" />
      <l-control-attribution
        :position="attributionPosition"
        :prefix="attributionPrefix"
      />
      <l-control-scale :imperial="imperial" />
      <l-marker
        v-for="marker in markers"
        :key="marker.id"
        :visible="marker.visible"
        :draggable="marker.draggable"
        :lat-lng.sync="marker.position"
        :icon="marker.icon"
        @click="alert(marker)"
      ></l-marker>
      <l-layer-group
        v-for="item in metroData"
        :key="item.id"
        :visible.sync="item.visible"
        layer-type="overlay"
        :name="item.name"
      >
        <l-layer-group :visible="item.markersVisible">
          <l-marker
            v-for="marker in item.markers"
            :key="marker.id"
            :visible="marker.visible"
            :draggable="marker.draggable"
            :lat-lng="marker.position"
            @click="alert(marker)"
          >
            <l-icon
              :icon-size="dynamicSize"
              :icon-anchor="dynamicAnchor"
              icon-url="/images/metro-marker.png"
            ></l-icon>
          </l-marker>
        </l-layer-group>
        <l-polyline
          :lat-lngs="item.polyline.points"
          :visible="item.polyline.visible"
        />
      </l-layer-group>
    </l-map>
    <a href="#" id="getScreenShot" @click="getScreenShot">Get Screenshot</a>
    <img v-if="mapScreenshot" :src="mapScreenshot" id="mapScreenshot" />
  </div>
</template>

<script>
import "leaflet";
import { latLngBounds } from "leaflet";
import {
  LMap,
  LTileLayer,
  LMarker,
  LPolyline,
  LLayerGroup,
  LControlZoom,
  LControlAttribution,
  LControlScale,
  LControlLayers,
  LIcon
} from "vue2-leaflet";

import "leaflet-simple-map-screenshoter";

const tileProviders = [
  {
    name: "OpenStreetMap",
    visible: true,
    attribution:
      '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  },
  {
    name: "OpenTopoMap",
    visible: false,
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  }
];

export default {
  name: "LeafletMap",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPolyline,
    LLayerGroup,
    LControlZoom,
    LControlAttribution,
    LControlScale,
    LControlLayers,
    LIcon
  },
  data() {
    return {
      simpleMapScreenshoter: null,
      center: [53.9, 27.56667],
      token: "your token if using mapbox",
      mapOptions: {
        zoomControl: false,
        attributionControl: false,
        zoomSnap: true
      },
      markers: [
        {
          id: 110,
          line: 1,
          tooltip: "Малиновка",
          position: { lat: 53.848379, lng: 27.474202 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 111,
          line: 1,
          tooltip: "Петровщина",
          position: { lat: 53.864788, lng: 27.485843 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 112,
          line: 1,
          tooltip: "Михалово",
          position: { lat: 53.876945, lng: 27.497036 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 113,
          line: 1,
          tooltip: "Грушевка",
          position: { lat: 53.886562, lng: 27.514768 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 114,
          line: 1,
          tooltip: "Институт Культуры",
          position: { lat: 53.886053, lng: 27.540352 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 115,
          line: 1,
          tooltip: "пл. Ленина",
          position: { lat: 53.893524, lng: 27.548114 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 116,
          line: 1,
          tooltip: "Октябрьская",
          position: { lat: 53.902263, lng: 27.56193 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 117,
          line: 1,
          tooltip: "пл. Победы",
          position: { lat: 53.90927, lng: 27.57527 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 118,
          line: 1,
          tooltip: "пл. Я. Коласа",
          position: { lat: 53.915926, lng: 27.583759 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 119,
          line: 1,
          tooltip: "Академия Наук",
          position: { lat: 53.922401, lng: 27.600198 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 120,
          line: 1,
          tooltip: "Парк Челюскинцев",
          position: { lat: 53.924288, lng: 27.613143 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 121,
          line: 1,
          tooltip: "Московская",
          position: { lat: 53.928084, lng: 27.627462 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 122,
          line: 1,
          tooltip: "Восток",
          position: { lat: 53.934605, lng: 27.651097 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 123,
          line: 1,
          tooltip: "Борисовский тракт",
          position: { lat: 53.93885, lng: 27.666206 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 124,
          line: 1,
          tooltip: "Уручье",
          position: { lat: 53.945565, lng: 27.687676 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 125,
          line: 1,
          tooltip: "Смоленская",
          position: { lat: 53.951108, lng: 27.706165 },
          active: false,
          draggable: false,
          visible: true
        },
        {
          id: 209,
          line: 2,
          tooltip: "Шабаны",
          position: { lat: 53.846431, lng: 27.708997 },
          active: false,
          draggable: false,
          visible: true
        },
        {
          id: 210,
          line: 2,
          tooltip: "Могилевская",
          position: { lat: 53.861798, lng: 27.673986 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 211,
          line: 2,
          tooltip: "Автозаводская",
          position: { lat: 53.868918, lng: 27.648105 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 212,
          line: 2,
          tooltip: "Партизанская",
          position: { lat: 53.875353, lng: 27.629627 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 213,
          line: 2,
          tooltip: "Тракторный завод",
          position: { lat: 53.890123, lng: 27.614347 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 214,
          line: 2,
          tooltip: "Пролетарская",
          position: { lat: 53.890372, lng: 27.586841 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 215,
          line: 2,
          tooltip: "Первомайская",
          position: { lat: 53.89379, lng: 27.570949 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 216,
          line: 2,
          tooltip: "Купаловская",
          position: { lat: 53.900798, lng: 27.561714 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 217,
          line: 2,
          tooltip: "Немига",
          position: { lat: 53.905732, lng: 27.554016 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 218,
          line: 2,
          tooltip: "Фрунзенская",
          position: { lat: 53.905408, lng: 27.539319 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 219,
          line: 2,
          tooltip: "Молодежная",
          position: { lat: 53.906527, lng: 27.523617 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 220,
          line: 2,
          tooltip: "Пушкинская",
          position: { lat: 53.909429, lng: 27.497251 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 221,
          line: 2,
          tooltip: "Спортивная",
          position: { lat: 53.908315, lng: 27.480758 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 222,
          line: 2,
          tooltip: "Кунцевщина",
          position: { lat: 53.906007, lng: 27.45423 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 223,
          line: 2,
          tooltip: "Каменная Горка",
          position: { lat: 53.906602, lng: 27.437415 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 224,
          line: 2,
          tooltip: "Красный Бор",
          position: { lat: 53.90937, lng: 27.416271 },
          active: false,
          draggable: false,
          visible: true
        },
        {
          id: 310,
          line: 3,
          tooltip: "Слуцкий гостинец",
          position: { lat: 53.84226, lng: 27.533712 },
          active: false,
          draggable: false,
          visible: true
        },
        {
          id: 311,
          line: 3,
          tooltip: "Неморшанский сад",
          position: { lat: 53.850077, lng: 27.537596 },
          active: false,
          draggable: false,
          visible: true
        },
        {
          id: 312,
          line: 3,
          tooltip: "Аэродромная",
          position: { lat: 53.867383, lng: 27.54679 },
          active: false,
          draggable: false,
          visible: true
        },
        {
          id: 313,
          line: 3,
          tooltip: "Ковальская Слобода",
          position: { lat: 53.87803, lng: 27.54978 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 314,
          line: 3,
          tooltip: "Вокзальная",
          position: { lat: 53.8895, lng: 27.548013 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 315,
          line: 3,
          tooltip: "пл. Ф. Багущевича",
          position: { lat: 53.896512, lng: 27.538089 },
          active: true,
          draggable: false,
          visible: true
        },
        {
          id: 316,
          line: 3,
          tooltip: "Юбилейная пл.",
          position: { lat: 53.904268, lng: 27.539945 },
          active: true,
          draggable: false,
          visible: true
        }
      ],
      mapScreenshot: "",
      zoom: 11,
      minZoom: 1,
      maxZoom: 20,
      zoomPosition: "topleft",
      attributionPosition: "bottomright",
      layersPosition: "topright",
      attributionPrefix: "TUT.BY",
      imperial: false,
      Positions: ["topleft", "topright", "bottomleft", "bottomright"],
      tileProviders: tileProviders,
      userStationsCount: 14,
      iconSize: 32,
      polylines: [
        {
          id: "p1",
          points: [
            { lat: 37.772, lng: -122.214 },
            { lat: 21.291, lng: -157.821 },
            { lat: -18.142, lng: -181.569 },
            { lat: -27.467, lng: -206.973 }
          ],
          visible: true
        }
      ],
      metroData: [
        {
          id: "l1",
          name: "Московская линия",
          markers: this.getStations1Line,
          polyline: { points: this.get1LineCoords, visible: true },
          visible: true,
          markersVisible: true
        }
      ]
    };
  },
  methods: {
    alert(item) {
      alert("this is " + JSON.stringify(item));
    },
    getScreenShot: function() {
      const map = this.$refs.map.mapObject;
      const that = this;
      if (!this.simpleMapScreenshoter) {
        this.simpleMapScreenshoter = window.L.simpleMapScreenshoter({
          screenName: function() {
            return new Date().toDateString();
          }
        }).addTo(map);
      }

      this.simpleMapScreenshoter
        .takeScreen("blob", {
          caption: function() {
            return "Hello world";
          }
        })
        .then(blob => {
          const reader = new FileReader();
          reader.onload = function() {
            const dataUrl = reader.result;
            const base64 = `data:image/jpeg;base64, ${dataUrl.split(",")[1]}`;
            that.mapScreenshot = base64;
          };
          reader.readAsDataURL(blob);
        })
        .catch(e => {
          alert(e.toString());
        });
    },
    putimage: function(src) {
      console.log(src);
    },
    addMarker: function() {
      const newMarker = {
        id: this.markers.length + 1,
        line: -1,
        position: { lat: 53.902263, lng: 27.56193 },
        active: false,
        draggable: true,
        visible: true
      };

      this.markers.push(newMarker);
    },
    removeLast: function() {
      this.markers.pop();
    },
    removeAll: function() {
      this.markers = this.markers.filter(el => el > -1);
    },
    showResults: function() {
      console.log("game over!");
    },
    removeMarker: function(index) {
      this.markers.splice(index, 1);
    },

    fitPolyline: function() {
      const bounds = latLngBounds(this.getStations(1).map(o => o.position));
      console.log(bounds);
      //this.bounds = bounds;
    },
    getLineCoords: function(lineNumber) {
      if (lineNumber === 1)
        return [
          { lat: 53.848379, lng: 27.474202 },
          { lat: 53.864788, lng: 27.485843 },
          { lat: 53.876945, lng: 27.497036 },
          { lat: 53.886562, lng: 27.514768 },
          { lat: 53.886053, lng: 27.540352 },
          { lat: 53.893524, lng: 27.548114 },
          { lat: 53.902263, lng: 27.56193 },
          { lat: 53.90927, lng: 27.57527 },
          { lat: 53.915926, lng: 27.583759 },
          { lat: 53.922401, lng: 27.600198 },
          { lat: 53.924288, lng: 27.613143 },
          { lat: 53.928084, lng: 27.627462 },
          { lat: 53.934605, lng: 27.651097 },
          { lat: 53.93885, lng: 27.666206 },
          { lat: 53.945565, lng: 27.687676 },
          { lat: 53.951108, lng: 27.706165 }
        ];
    }
  },
  computed: {
    dynamicSize() {
      return [this.iconSize, this.iconSize * 1.15];
    },
    dynamicAnchor() {
      return [this.iconSize / 2, this.iconSize * 1.15];
    },
    userStationsLeft() {
      return this.userStationsCount - this.markers.length;
    },
    userStationAdded() {
      return this.markers.length;
    },
    getStations1Line() {
      return this.markers.filter(el => el.line === 1);
    },
    getStations2Line() {
      return this.markers.filter(el => el.line === 2);
    },
    getStations3Line() {
      return this.markers.filter(el => el.line === 3);
    },
    getStationsUserLine() {
      return this.markers.filter(el => el.line === -1);
    },
    get1LineCoords() {
      return this.markers
        .filter(el => el.line === 1)
        .map(el => {
          return { ...el.position };
        });
    }
  },
  mounted() {
    this.$nextTick(() => {
      //const map = this.$refs.map.mapObject;
      /*var simpleMapScreenshoter = window.L.simpleMapScreenshoter({
        hidden: true
      }).addTo(map);*/
      // window.L.simpleMapScreenshoter({
      //   screenName: function() {
      //     return new Date().toDateString();
      //   }
      // }).addTo(map);
    });
  }
};
</script>

<style scoped lang="scss">
#metro-lines-settings {
  th {
    text-align: left;
  }
}
</style>
