<template>
  <div>
    <popup-modal
      v-if="showPopup"
      @onShowResult="closePopup(true)"
      @onClosePopup="closePopup"
    >
      <p slot="header">{{ inputParams.finalPopupText }}</p>
      <template slot="button">{{ inputParams.finalPopupButton }}</template>
    </popup-modal>

    <section v-if="gameStep === 1" class="start-section">
      <section class="section-header">
        <div class="section-label">{{ inputParams.gameLabel }}</div>
        <h2>{{ inputParams.startHeader }}</h2>
        <div class="section-meta" v-html="inputParams.startMeta"></div>
        <div class="description" v-html="inputParams.startText"></div>
      </section>

      <div
        class="section-image start-animation-metro"
        :class="{ 'train-arrived': isTrainArrived }"
      >
        <div class="metro-bg-01">
          <img src="../assets/images/tunnel-inner.png" alt />
        </div>
        <div class="metro-bg-02">
          <img src="../assets/images/tunnel.png" alt />
        </div>
        <div class="metro-bg-03">
          <img src="../assets/images/metro.png" alt />
        </div>
      </div>

      <ui-button @click="gameStep = 2">Начать игру</ui-button>
    </section>

    <section v-if="gameStep === 2">
      <section class="section-header">
        <h2>{{ inputParams.gameHeader }}</h2>
        <div class="description" v-html="inputParams.gameText"></div>
      </section>
      <l-map
        ref="map"
        :zoom.sync="zoom"
        :min-zoom="minZoom"
        :max-zoom="maxZoom"
        :zoomAnimation="true"
        :options="mapOptions"
        :center="center"
        :bounds="bounds"
        :max-bounds="maxBounds"
        style="height: 480px; width: 100%;"
        @click="onMapClick"
      >
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

        <l-control position="topleft">
          <div class="stations-count">
            <span v-if="userStationsLeft > 0">
              Еще можно поставить
              <span class="label">{{ userStationsLeft }}</span>
              {{ getPluralPoints(userStationsLeft) }}
            </span>
            <span v-else>Точек не осталось</span>
          </div>
        </l-control>

        <l-control-zoom :position="zoomPosition" />

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

      <div v-if="userStationAdded > 0" class="game-actions">
        <ui-button button-class="light" @click="removeLast"
          >Удалить последнюю точку</ui-button
        >
        <ui-button :is-disabled="isDisabledFinishButton" @click="showResults"
          >Готово</ui-button
        >
      </div>
    </section>

    <section v-if="gameStep === 3">
      <section class="section-header">
        <h2>{{ inputParams.finalHeader }}</h2>
        <div class="description" v-html="inputParams.finalText"></div>
        <div class="game-results">
          <div class="result-map user-map">
            <img :src="mapScreenshot" alt />
            <div class="map-description">
              {{ inputParams.userMapDescription }}
            </div>
          </div>

          <div class="result-map gov-map">
            <l-map
              ref="map"
              :zoom="10"
              :min-zoom="10"
              :max-zoom="10"
              :options="mapOptions"
              :center="center"
              :bounds="bounds"
              :max-bounds="maxBounds"
              style="height: 235px; width: 100%;"
            >
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
                    :weight="2"
                    :radius="4"
                  >
                    <l-tooltip :content="marker.tooltip" />
                  </l-circle-marker>
                </l-layer-group>
                <l-polyline
                  :lat-lngs="item.polyline.points"
                  :visible="item.polyline.visible"
                  :color="item.polyline.color"
                  class="metro-line"
                />
              </l-layer-group>

              <l-layer-group
                v-for="item in this.getStations3Coords()"
                :key="item.id"
                :visible.sync="item.visible"
                layer-type="overlay"
                :name="item.name"
              >
                <l-circle-marker
                  :lat-lng="item.position"
                  :visible="item.visible"
                  color="#84B132"
                  fillColor="#fff"
                  :fillOpacity="1.0"
                  :weight="2"
                  :radius="4"
                ></l-circle-marker>
              </l-layer-group>

              <l-polyline
                :lat-lngs="[...this.getLine3Coords()]"
                :visible="true"
                color="#84B132"
                class="metro-line-3"
              />
            </l-map>
            <div class="map-description">
              {{ inputParams.metroMapDescription }}
            </div>
          </div>
        </div>
        <div
          v-if="inputParams.mapDescription.trim().length > 0"
          class="game-result-description"
        >
          {{ inputParams.mapDescription }}
        </div>
      </section>
    </section>
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
  LTooltip,
  LControl,
  LControlZoom,
  LIcon,
  LCircleMarker
} from "vue2-leaflet";

import "leaflet-simple-map-screenshoter";
import UiButton from "./ui/UiButton";
import PopupModal from "./PopupModal";
import plural from "plural-ru";

const tileProviders = [
  {
    name: "MapBox light-v9",
    visible: true,

    attribution: "",
    url:
      "https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGFuZGxhciIsImEiOiJja2F5NXV5eW4wY3dvMnFxcWl4Z3ZncHprIn0.tIkQNvDbzUyfdUAkDNG7Cg"
  }
];

const stations = [
  {
    id: 110,
    line: 1,
    tooltip: "Малінаўка (Малиновка)",
    position: { lat: 53.8498337, lng: 27.4747816 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-1"
  },
  {
    id: 111,
    line: 1,
    tooltip: "Пятроўшчына (Петровщина)",
    position: { lat: 53.8645777, lng: 27.4860214 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-1"
  },
  {
    id: 112,
    line: 1,
    tooltip: "Міхалова (Михалово)",
    position: { lat: 53.8766884, lng: 27.4969447 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-1"
  },
  {
    id: 113,
    line: 1,
    tooltip: "Грушаўка (Грушевка)",
    position: { lat: 53.8861937, lng: 27.5133705 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-1"
  },
  {
    id: 114,
    line: 1,
    tooltip: "Інстытут Культуры (Институт Культуры)",
    position: { lat: 53.885906, lng: 27.5406861 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-1"
  },
  {
    id: 115,
    line: 1,
    tooltip: "Плошча Леніна (Площадь Ленина)",
    position: { lat: 53.8926399, lng: 27.5476491 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-1"
  },
  {
    id: 116,
    line: 1,
    tooltip: "Кастрычніцкая (Октябрьская)",
    position: { lat: 53.902129, lng: 27.5621384 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-1"
  },
  {
    id: 117,
    line: 1,
    tooltip: "Плошча Перамогі (Площадь Победы)",
    position: { lat: 53.909505, lng: 27.5762415 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-1"
  },
  {
    id: 118,
    line: 1,
    tooltip: "Плошча Якуба Коласа (Площадь Якуба Коласа)",
    position: { lat: 53.9158972, lng: 27.584213 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-1"
  },
  {
    id: 119,
    line: 1,
    tooltip: "Акадэмія Навук (Академия Наук)",
    position: { lat: 53.9217671, lng: 27.5992227 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-1"
  },
  {
    id: 120,
    line: 1,
    tooltip: "Парк Чалюскінцаў (Парк Челюскинцев)",
    position: { lat: 53.9241679, lng: 27.6133525 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-1"
  },
  {
    id: 121,
    line: 1,
    tooltip: "Маскоўская (Московская)",
    position: { lat: 53.9279268, lng: 27.6276219 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-1"
  },
  {
    id: 122,
    line: 1,
    tooltip: "Усход (Восток)",
    position: { lat: 53.9344645, lng: 27.651279 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-1"
  },
  {
    id: 123,
    line: 1,
    tooltip: "Барысаўскі тракт (Борисовский тракт)",
    position: { lat: 53.9384972, lng: 27.6657629 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-1"
  },
  {
    id: 124,
    line: 1,
    tooltip: "Уручча (Уручье)",
    position: { lat: 53.9453522, lng: 27.6878643 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-1"
  },
  {
    id: 210,
    line: 2,
    tooltip: "Магілеўская (Могилевская)",
    position: { lat: 53.8620975, lng: 27.6737612 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-2"
  },
  {
    id: 211,
    line: 2,
    tooltip: "Аўтазаводская (Автозаводская)",
    position: { lat: 53.8690757, lng: 27.6485592 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-2"
  },
  {
    id: 212,
    line: 2,
    tooltip: "Партызанская (Партизанская)",
    position: { lat: 53.8762394, lng: 27.628963 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-2"
  },
  {
    id: 213,
    line: 2,
    tooltip: "Трактарны завод (Тракторный завод)",
    position: { lat: 53.8900888, lng: 27.6144147 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-2"
  },
  {
    id: 214,
    line: 2,
    tooltip: "Пралетарская (Пролетарская)",
    position: { lat: 53.8899908, lng: 27.5861388 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-2"
  },
  {
    id: 215,
    line: 2,
    tooltip: "Першамайская (Первомайская)",
    position: { lat: 53.8939772, lng: 27.5706518 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-2"
  },
  {
    id: 216,
    line: 2,
    tooltip: "Купалаўская (Купаловская)",
    position: { lat: 53.9008743, lng: 27.5618005 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-2"
  },
  {
    id: 217,
    line: 2,
    tooltip: "Няміга (Немига)",
    position: { lat: 53.9057729, lng: 27.5539362 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-2"
  },
  {
    id: 218,
    line: 2,
    tooltip: "Фрунзенская (Фрунзенская)",
    position: { lat: 53.9053463, lng: 27.5392082 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-2"
  },
  {
    id: 219,
    line: 2,
    tooltip: "Маладзежная (Молодежная)",
    position: { lat: 53.90674, lng: 27.5226456 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-2"
  },
  {
    id: 220,
    line: 2,
    tooltip: "Пушкінская (Пушкинская)",
    position: { lat: 53.9096567, lng: 27.4970198 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-2"
  },
  {
    id: 221,
    line: 2,
    tooltip: "Спартыўная (Спортивная)",
    position: { lat: 53.9084275, lng: 27.4793816 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-2"
  },
  {
    id: 222,
    line: 2,
    tooltip: "Кунцаўшчына (Кунцевщина)",
    position: { lat: 53.9062691, lng: 27.4539918 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-2"
  },
  {
    id: 223,
    line: 2,
    tooltip: "Каменная Горка (Каменная Горка)",
    position: { lat: 53.9068364, lng: 27.4377001 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-2"
  },
  {
    id: 310,
    line: 3,
    tooltip: "Слуцкі Гасцінец (Слуцкий Гостинец)",
    position: { lat: 53.843596, lng: 27.534163 },
    active: false,
    draggable: false,
    visible: true,
    className: "stations-line-3"
  },
  {
    id: 311,
    line: 3,
    tooltip: "Немаршанскі парк (Неморшанский парк)",
    position: { lat: 53.850185, lng: 27.5367486 },
    active: false,
    draggable: false,
    visible: true,
    className: "stations-line-3"
  },
  {
    id: 312,
    line: 3,
    tooltip: "Аэрадромная (Аэродромная)",
    position: { lat: 53.8658904, lng: 27.5434113 },
    active: false,
    draggable: false,
    visible: true,
    className: "stations-line-3"
  },
  {
    id: 313,
    line: 3,
    tooltip: "Кавальская Слабада (Ковальская Слобода)",
    position: { lat: 53.8777352, lng: 27.5495803 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-3"
  },
  {
    id: 314,
    line: 3,
    tooltip: "Вакзальная (Вокзальная)",
    position: { lat: 53.8897063, lng: 27.5474668 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-3"
  },
  {
    id: 315,
    line: 3,
    tooltip: "Плошча Францішка Багушэвіча (Площадь Франтишка Богушевича)",
    position: { lat: 53.8964713, lng: 27.5379986 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-3"
  },
  {
    id: 316,
    line: 3,
    tooltip: "Юбілейная плошча (Юбилейная площадь)",
    position: { lat: 53.9046542, lng: 27.5402731 },
    active: true,
    draggable: false,
    visible: true,
    className: "stations-line-3"
  },
  {
    id: 317,
    line: 3,
    tooltip: "Прафсаюзная (Профсоюзная)",
    position: { lat: 53.9122399, lng: 27.5459996 },
    active: false,
    draggable: false,
    visible: true,
    className: "stations-line-3"
  },
  {
    id: 318,
    line: 3,
    tooltip: "Пярэспа (Переспа)",
    position: { lat: 53.9176096, lng: 27.5566936 },
    active: false,
    draggable: false,
    visible: true,
    className: "stations-line-3"
  },
  {
    id: 319,
    line: 3,
    tooltip: "Камароўская (Комаровская)",
    position: { lat: 53.921328, lng: 27.5676048 },
    active: false,
    draggable: false,
    visible: true,
    className: "stations-line-3"
  },
  {
    id: 320,
    line: 3,
    tooltip: "Парк Дружбы народаў (Парк Дружбы народов)",
    position: { lat: 53.9317801, lng: 27.5774378 },
    active: false,
    draggable: false,
    visible: true,
    className: "stations-line-3"
  },
  {
    id: 321,
    line: 3,
    tooltip: "Івана Мележа (Ивана Мележа)",
    position: { lat: 53.9431831, lng: 27.5889498 },
    active: false,
    draggable: false,
    visible: true,
    className: "stations-line-3"
  },
  {
    id: 322,
    line: 3,
    tooltip: "Зялены Луг (Зеленый Луг)",
    position: { lat: 53.9495401, lng: 27.6066229 },
    active: false,
    draggable: false,
    visible: true,
    className: "stations-line-3"
  },
  {
    id: 323,
    line: 3,
    tooltip: "Лагойская (Логойская)",
    position: { lat: 53.9558141, lng: 27.6213241 },
    active: false,
    draggable: false,
    visible: true,
    className: "stations-line-3"
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
    LTooltip,
    LControl,
    LControlZoom,
    LIcon,
    LCircleMarker,
    PopupModal,
    UiButton
  },
  data() {
    return {
      gameStep: 1,
      isTrainArrived: false,
      inputParams: {},
      isGameOver: false,
      simpleMapScreenshoter: null,
      center: [53.9, 27.56667],
      token:
        "pk.eyJ1IjoiaGFuZGxhciIsImEiOiJja2F5NXV5eW4wY3dvMnFxcWl4Z3ZncHprIn0.tIkQNvDbzUyfdUAkDNG7Cg",
      mapOptions: {
        zoomControl: false,
        attributionControl: false,
        zoomSnap: true
      },
      markers: [],
      mapScreenshot: "",
      zoom: 11,
      distanceBetweenStantions: 0.2,
      minZoom: 11,
      maxZoom: 15,
      zoomPosition: "topleft",
      attributionPosition: "bottomright",
      layersPosition: "topright",
      attributionPrefix: "TUT.BY",
      imperial: false,
      Positions: ["topleft", "topright", "bottomleft", "bottomright"],
      tileProviders: tileProviders,
      userStationsCount: 14,
      iconSize: 20,
      iconAnchor: [20, 51],
      // cell size = 7x5 [66x35]
      minLat: 53.8058,
      maxLat: 53.9808,
      minLng: 27.382,
      maxLng: 27.844,
      bounds: latLngBounds([
        [53.8058, 27.382],
        [53.9808, 27.844]
      ]),
      maxBounds: latLngBounds([
        [53.8058, 27.382],
        [53.9808, 27.844]
      ]),
      metroData: [
        {
          id: "l1",
          name: "Московская линия",
          markers: this.getStations1Coords(),
          polyline: {
            points: this.getLine1Coords(),
            visible: true,
            color: "#3E73C9"
          },
          markersColor: "#3E73C9",
          visible: true,
          markersVisible: true
        },
        {
          id: "l2",
          name: "Заводская линия",
          markers: this.getStations2Coords(),
          polyline: {
            points: this.getLine2Coords(),
            visible: true,
            color: "#E2546B"
          },
          markersColor: "#E2546B",
          visible: true,
          markersVisible: true
        }
      ],
      showPopup: false
    };
  },
  methods: {
    alert(item) {
      alert("this is " + JSON.stringify(item));
    },
    closePopup(showResult) {
      this.showPopup = false;
      if (showResult) this.showResults();
    },
    getPluralPoints(count) {
      return plural(count, "точку", "точки", "точек");
    },
    onMapClick: function(e) {
      //console.log();
      if (this.userStationsLeft > 0) this.addMarker(e);
    },
    createUserMarkerTooltip: function(pos) {
      return `lat: ${pos.lat} | lng: ${pos.lng}`;
    },
    getScreenShot: function() {
      const map = this.$refs.map.mapObject;
      const that = this;
      if (!this.simpleMapScreenshoter) {
        const pluginOptions = {
          hidden: true, // hide screen icon
          screenName: () => new Date().toDateString() // string or function
        };
        this.simpleMapScreenshoter = window.L.simpleMapScreenshoter(
          pluginOptions
        ).addTo(map);
      }

      this.simpleMapScreenshoter
        .takeScreen("blob")
        .then(blob => {
          const reader = new FileReader();
          reader.onload = function() {
            const dataUrl = reader.result;
            const base64 = `data:image/jpeg;base64, ${dataUrl.split(",")[1]}`;
            that.mapScreenshot = base64;
            that.isGameOver = true;
          };
          reader.readAsDataURL(blob);
        })
        .catch(e => {
          console.error(e.toString());
        });
    },
    getLatLngForUserMarker: function() {
      const latDelta = this.maxLat - this.minLat;
      const lngDelta = this.maxLng - this.minLng;
      const rndLat = Math.random() * latDelta;
      const rndLng = Math.random() * lngDelta;
      const lat = this.minLat + rndLat;
      const lng = this.minLng + rndLng;
      return { lat, lng };
    },
    addMarker: function(e) {
      let position;

      if (e.latlng !== undefined) {
        position = [e.latlng.lat, e.latlng.lng];
      } else {
        position = this.getLatLngForUserMarker();
      }
      const newMarker = {
        id: this.markers.length + 1,
        line: -1,
        position: position,
        active: true,
        draggable: true,
        visible: true,
        icon: "./images/green-marker.png",
        className: "user-marker"
      };
      this.markers.push(newMarker);
      if (this.markers.length === this.userStationsCount) this.showPopup = true;
    },
    removeLast: function() {
      this.markers.pop();
    },
    showResults: function() {
      this.zoom = 11;
      const that = this;
      setTimeout(function() {
        that.getScreenShot();
      }, 1000);
    },
    removeMarker: function(index) {
      this.markers.splice(index, 1);
    },

    getStations1Coords: () => stations.filter(el => el.line === 1),

    getStations2Coords: () => stations.filter(el => el.line === 2),

    getStations3Coords: () => stations.filter(el => el.line === 3),

    getLine1Coords: function() {
      return this.getStations1Coords().map(el => el.position);
    },

    getLine2Coords: function() {
      return this.getStations2Coords().map(el => el.position);
    },

    getLine3Coords: function() {
      return this.getStations3Coords().map(el => el.position);
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.inputParams = window.inputData;
      setTimeout(() => (this.isTrainArrived = true), 1000);
    });
  },
  computed: {
    markersLine() {
      if (this.markers.length === 0) {
        return [];
      } else {
        return this.markers.map(el => el.position);
      }
    },
    isDisabledFinishButton() {
      return this.userStationAdded < 4;
    },
    dynamicSize() {
      return [this.iconSize, this.iconSize * 1.15];
    },
    dynamicAnchor() {
      return [this.iconSize / 2, this.iconSize / 2];
    },
    userMarkers() {
      return this.markers.filter(el => el.line === -1);
    },
    userStationsLeft() {
      return this.userStationsCount - this.userMarkers.length;
    },
    userStationAdded() {
      return this.userMarkers.length;
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
    }
  }
};
</script>

<style lang="scss">
#metro-lines-settings {
  th {
    text-align: left;
  }
}
.leaflet-control-simpleMapScreenshoter {
  border: none;
}
.leaflet-marker-icon {
  &.stations-line-1,
  &.stations-line-2,
  &.stations-line-3 {
    width: 20px !important;
    height: 20px !important;
  }
}
.leaflet-interactive {
  width: 20px;
  height: 20px;
}
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
    width: 25px;
    height: 25px;
    font-size: 13px;
    background: #9fc226;
    color: #fff;
    line-height: 25px;
  }
}
.user-marker {
  span {
    display: inline-block;
    width: 20px;
    box-sizing: border-box;
    height: 20px;
    font-size: 9px;
    line-height: 12px;
    font-family: Arial;
    border-radius: 50%;
    border: 4px solid #83a801;
    background-color: #fff;
  }
}
#mapScreenshot {
  width: 100%;
  max-width: 720px;
}

.leaflet-left .leaflet-control.leaflet-control-zoom {
  margin-left: 15px;
}

.game-section {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;

  h2 {
    text-align: left;
    margin: 0;
    font-size: 35px;
    line-height: 41px;
  }
}
.game-actions {
  margin-top: 22px;
  display: flex;

  .button {
    width: 50%;

    &:first-child {
      margin-right: 12px;
    }
    &:last-child {
      margin-left: 12px;
    }
    &.green {
      background-color: #9fc226;
      color: #fff;
    }
  }
}
.game-results {
  display: flex;
  flex-direction: row;
  margin-top: 25px;

  .result-map {
    width: 50%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    figure {
      margin: 0;
    }
    &:first-child {
      margin-right: 6px;
    }

    &:last-child {
      margin-left: 6px;
    }
    img {
      width: 100%;
    }
  }
}
.game-result-description {
  font-size: 16px;
  line-height: 19px;
  margin-top: 20px;
}
.start-section {
  .section-header {
    text-align: center;
  }
}
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

.start-animation-metro {
  position: relative;
  width: 600px;
  height: 340px;
  margin: 0 auto;
  overflow: hidden;
  &.train-arrived {
    .metro-bg-03 {
      left: 0;
    }
  }
  .metro-bg-01 {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 1;
    img {
      vertical-align: bottom;
    }
  }
  .metro-bg-02 {
    position: absolute;
    left: -104px;
    bottom: 0;
    z-index: 10;
    img {
      vertical-align: bottom;
    }
  }
  .metro-bg-03 {
    position: absolute;
    left: -600px;
    bottom: -1px;
    z-index: 5;
    transition: left 1s cubic-bezier(0.24, 0.65, 0.53, 0.96);

    img {
      vertical-align: bottom;
    }
  }
}
</style>
