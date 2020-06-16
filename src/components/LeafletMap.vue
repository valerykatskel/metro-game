<template>
  <div>
    <app-loader v-if="showLoader" />
    <popup-modal
      v-if="showPopup"
      @onShowResult="closePopup(true)"
      @onClosePopup="closePopup"
    >
      <p slot="header">{{ inputParams.finalPopupText }}</p>
      <template slot="button">{{ inputParams.finalPopupButton }}</template>
    </popup-modal>

    <section v-show="gameStep === 1" class="start-section">
      <section-header
        :section-label="inputParams.gameLabel"
        :section-header="inputParams.startHeader"
        :section-meta="inputParams.startMeta"
        :section-description="inputParams.startText"
      />

      <div class="section-image start-animation-metro">
        <div class="metro-bg-01">
          <img
            src="https://img.tyt.by/news/special/metro-game/tunnel-inner.png"
            alt
          />
        </div>
        <div class="metro-bg-02">
          <img
            src="https://img.tyt.by/news/special/metro-game/tunnel.png"
            alt
          />
        </div>
        <div class="metro-bg-03">
          <img src="https://img.tyt.by/news/special/metro-game/metro.png" alt />
        </div>
      </div>

      <ui-button button-class="start-game-button start" @click="gameStep = 2">
        {{ inputParams.startButton }}
      </ui-button>
    </section>

    <section v-if="gameStep === 2">
      <section-header
        :section-header="inputParams.gameHeader"
        :section-description="inputParams.gameText"
      />
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
      <section-header
        :section-header="inputParams.finalHeader"
        :section-description="inputParams.finalText"
      />

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
              :name="tileProvider.name"
              :url="tileProvider.url"
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

      <ui-button button-class="start-game-button start" @click="runGameAgain"
        >Начать заново</ui-button
      >
    </section>
    <sharing-list v-show="gameStep === 3" />
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
import AppLoader from "./AppLoader";
import SectionHeader from "./SectionHeader";
import SharingList from "./SharingList";

import { gsap } from "gsap";

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
    AppLoader,
    UiButton,
    SectionHeader,
    SharingList
  },
  data() {
    return {
      gameStep: 1,
      inputParams: {},
      simpleMapScreenshoter: null,
      showLoader: false,
      mapScreenshot: "",
      markers: [],
      center: [53.9, 27.56667],
      mapOptions: {
        zoomControl: false,
        attributionControl: false,
        zoomSnap: true
      },
      zoom: 11,
      minZoom: 11,
      maxZoom: 15,
      tileProvider: {
        name: "MapBox light-v9",
        visible: true,
        attribution: "",
        url:
          "https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGFuZGxhciIsImEiOiJja2F5NXV5eW4wY3dvMnFxcWl4Z3ZncHprIn0.tIkQNvDbzUyfdUAkDNG7Cg"
      },
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
            color: "#4692F0"
          },
          markersColor: "#4692F0",
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
            color: "#FB6483"
          },
          markersColor: "#FB6483",
          visible: true,
          markersVisible: true
        }
      ],
      showPopup: false
    };
  },
  methods: {
    closePopup(showResult) {
      this.showPopup = false;
      if (showResult) this.showResults();
    },
    handleResult(res) {
      const img = new Image();
      const that = this;
      img.onload = () => {
        let sharelist = Array.from(
          document.querySelectorAll(".app-sharelist .b-sharelist__li")
        );

        sharelist.forEach(el => {
          const link = el.querySelector("a");
          debugger;
          const network = link.id;

          const shareTutByLink = encodeURIComponent("https://share.tut.by?");
          const url = encodeURIComponent(that.inputParams.sharingUrl);
          const title = encodeURIComponent(that.inputParams.sharingTitle);
          const image = encodeURIComponent(res.secure_url);

          var shareData = btoa(JSON.stringify({ url, title, image }))
            .replace(/=+$/g, "")
            .replace(/(.)(.)/g, "$2$1");

          if (network === "shareLinkFB")
            link.setAttribute(
              "href",
              `https://www.facebook.com/sharer.php?u=${shareTutByLink}${shareData}`
            );
          else if (network === "share-vk")
            link.setAttribute(
              "href",
              `https://vk.com/share.php?url=${url}&title=${title}&description="description"&image=${image}&noparse=true`
            );
          else if (network === "shareLinkTW")
            link.setAttribute(
              "href",
              `https://twitter.com/share?url=${url}&text=${title}`
            );
          else if (network === "shareLinkOD")
            link.setAttribute(
              "href",
              `https://connect.ok.ru/offer?url=${shareTutByLink}${shareData}`
            );
          else if (network === "shareLinkTG")
            link.setAttribute(
              "href",
              `https://t.me/share/url?url=${shareTutByLink}${shareData}`
            );
          else if (network === "shareLinkVB")
            link.setAttribute(
              "href",
              `viber://forward?text=${shareTutByLink}${shareData}`
            );
        });

        this.gameStep = 3;
        this.mapScreenshot = res.secure_url;
        this.showLoader = false;
      };
      img.src = res.secure_url;
    },
    onMapClick(e) {
      if (this.userStationsLeft > 0) this.addMarker(e);
    },
    createUserMarkerTooltip(pos) {
      return `lat: ${pos.lat} | lng: ${pos.lng}`;
    },
    getScreenShot() {
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
            const base64Str = reader.result.split(",")[1];

            var myHeaders = new Headers();
            myHeaders.append(
              "Content-Type",
              "application/x-www-form-urlencoded"
            );

            var urlencoded = new URLSearchParams();
            urlencoded.append("base64Str", base64Str);
            urlencoded.append("upldf", "metro-game");
            var requestOptions = {
              method: "POST",
              headers: myHeaders,
              body: urlencoded,
              redirect: "follow"
            };
            //const urlToCloudinaryUploader = "http://localhost:8088/upload";
            const urlToCloudinaryUploader =
              "https://tut-quiz.herokuapp.com/upload";
            fetch(urlToCloudinaryUploader, requestOptions)
              .then(response => response.json())
              .then(result => {
                that.handleResult(result);
              })
              .catch(error => console.log(error));
          };
          reader.readAsDataURL(blob);
        })
        .catch(e => {
          console.error(e.toString());
        });
    },
    getLatLngForUserMarker() {
      const latDelta = this.maxLat - this.minLat;
      const lngDelta = this.maxLng - this.minLng;
      const rndLat = Math.random() * latDelta;
      const rndLng = Math.random() * lngDelta;
      const lat = this.minLat + rndLat;
      const lng = this.minLng + rndLng;
      return { lat, lng };
    },
    addMarker(e) {
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
        icon: "https://img.tyt.by/news/special/metro-game/green-marker.png",
        icon2x:
          "https://img.tyt.by/news/special/metro-game/green-marker@2x.png",
        className: "user-marker"
      };
      this.markers.push(newMarker);
      if (this.markers.length === this.userStationsCount) this.showPopup = true;
    },
    removeLast() {
      this.markers.pop();
    },
    showResults() {
      this.showLoader = true;
      this.zoom = 11;
      const that = this;
      setTimeout(function() {
        that.getScreenShot();
      }, 1000);
    },
    removeMarker(index) {
      this.markers.splice(index, 1);
    },

    runTonnelAnimation() {
      // gsap animation for start game section
      const metroEl = document.querySelector(".metro-bg-03");
      const tonnelEl = document.querySelector(".metro-bg-01");
      const startGameBtn = document.querySelector(".start-game-button");
      gsap.fromTo(tonnelEl, 1, { opacity: 0 }, { opacity: 1 });
      gsap.fromTo(metroEl, 0.8, { left: -600 }, { left: 0 });
      gsap.fromTo(
        startGameBtn,
        { opacity: 0 },
        { duration: 1.5, delay: 2.5, opacity: 1 }
      );
    },
    runGameAgain() {
      this.gameStep = 1;
      this.markers = [];
      this.simpleMapScreenshoter = null;
      this.mapScreenshot = "";
      this.runTonnelAnimation();
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

      this.runTonnelAnimation();
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
  margin-bottom: 30px;

  .result-map {
    width: 50%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .map-description {
      text-align: left;
      color: #808080;
      font-size: 13px;
      line-height: 18px;
      margin-top: 10px;
    }

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
  .start-game-button {
    opacity: 0;
    width: 100%;
  }
}

.start-animation-metro {
  position: relative;
  width: 600px;
  height: 340px;
  margin: 0 auto;
  overflow: hidden;
  margin-bottom: 30px;

  .metro-bg-01 {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 1;
    opacity: 1;
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
    bottom: 0;
    z-index: 5;
    transition: left 1500ms cubic-bezier(0.24, 0.65, 0.53, 0.96);

    img {
      vertical-align: bottom;
    }
  }
}
</style>
