<template>
  <div>
    <app-loader v-if="showLoader" />
    <popup-modal
      v-if="popup.show"
      @onShowResult="closePopup(true)"
      @onClosePopup="closePopup"
    >
      <p slot="header">{{ popup.text }}</p>
      <template v-if="popup.showButton" slot="button">
        {{ inputParams.finalPopupButton }}
      </template>
    </popup-modal>

    <popup-modal
      v-if="showPasswordInput"
      @onShowResult="closePopup(true)"
      @onShowStat="showStat"
      @onClosePopup="closePopup"
    >
      <p slot="header">Антон, введи пароль для получения статистики :)</p>
      <template slot="body">
        <input type="password" />
      </template>
      <template slot="buttonstat">Показать</template>
    </popup-modal>

    <section
      v-shortkey="['ctrl', 'alt', 'space']"
      @shortkey="theAction"
      v-show="gameStep === 1"
      class="app-section start-section"
    >
      <section-header
        :section-label="inputParams.gameLabel"
        :section-header="inputParams.startHeader"
        :section-meta="inputParams.startMeta"
        :section-description="inputParams.startText"
      />

      <animation-start-slide />

      <ui-button button-class="start-game-button start" @click="gameStep = 2">{{
        inputParams.startButton
      }}</ui-button>
    </section>

    <section v-if="gameStep === 2" class="app-section">
      <section-header
        :section-header="inputParams.gameHeader"
        :section-description="inputParams.gameText"
      />
      <l-map
        :zoom="map.zoom.value"
        :min-zoom="map.zoom.min"
        :max-zoom="map.zoom.max"
        :options="map.options"
        :bounds="map.bounds"
        :max-bounds="map.bounds"
        style="height: 480px; width: 100%;"
        @click="onMapClick"
      >
        <l-tile-layer :url="map.tileUrl" layer-type="base" />

        <l-control position="topleft">
          <user-stations-info :count="userStationsLeft" />
        </l-control>

        <l-control-zoom position="bottomright" />

        <l-layer-group
          v-for="item in map.data"
          :key="item.id"
          :visible.sync="item.visible"
          layer-type="overlay"
          :name="item.name"
        >
          <l-layer-group>
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
            @update:latLng="moveUserMarkerHandler($event, marker.id)"
          >
            <l-icon
              :icon-anchor="dynamicAnchor"
              :className="marker.className"
              iconUrl="/public/images/green-market.png"
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

    <section v-if="gameStep === 3" class="app-section section-finish">
      <section-header
        :section-header="inputParams.finalHeader"
        :section-description="inputParams.finalText"
      />

      <div class="game-results" id="sharingImage">
        <div class="result-map user-map">
          <!-- <div class="user-map-wrapper">
            <img :src="mapScreenshot" alt />
          </div>-->
          <l-map
            ref="map"
            :zoom="10"
            :min-zoom="10"
            :max-zoom="10"
            :options="map.options"
            :bounds="map.bounds"
            :max-bounds="map.bounds"
            style="height: 235px; width: 100%;"
          >
            <l-tile-layer :url="map.tileUrl" layer-type="base" />

            <l-layer-group
              v-for="item in map.data"
              :key="item.id"
              :visible.sync="item.visible"
              layer-type="overlay"
              :name="item.name"
            >
              <l-layer-group>
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
              v-for="item in this.markers"
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
              :lat-lngs="[...this.getUserLineCoords()]"
              :visible="true"
              color="#84B132"
              class="metro-line-3"
            />
          </l-map>
          <div class="map-description">
            {{ inputParams.userMapDescription }}
          </div>
        </div>

        <div class="result-map gov-map">
          <l-map
            :zoom="10"
            :min-zoom="10"
            :max-zoom="10"
            :options="map.options"
            :bounds="map.bounds"
            :max-bounds="map.bounds"
            style="height: 235px; width: 100%;"
          >
            <l-tile-layer :url="map.tileUrl" layer-type="base" />

            <l-layer-group
              v-for="item in map.data"
              :key="item.id"
              :visible.sync="item.visible"
              layer-type="overlay"
              :name="item.name"
            >
              <l-layer-group>
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
      <div class="game-results-buttons">
        <ui-button button-class="light" @click="runGameAgain"
          >Начать заново</ui-button
        >
        <ui-button button-class="light" @click="showHotmap"
          >Показать hotmap</ui-button
        >
        <div v-if="!isNull(commentsBlock)" v-html="commentsBlock" />
      </div>
    </section>

    <section v-if="gameStep === 4" class="app-section">
      <section-header
        section-header="Статистика пользовательских точек"
        section-description="На этой версии карты можно оценить, где больше всего пользователи TUT.BY хотят, чтобы появились новые станции метро"
      />
      <l-map
        :zoom="map.zoom.value"
        :min-zoom="map.zoom.min"
        :max-zoom="map.zoom.max"
        :options="map.options"
        :bounds="map.bounds"
        :max-bounds="map.bounds"
        style="height: 480px; width: 100%;"
      >
        <l-tile-layer :url="map.tileUrl" layer-type="base" />

        <l-layer-group>
          <l-polygon
            v-for="cell in cellCoords"
            :key="cell.id"
            :lat-lngs="cell.coords"
            color="#ffc9c9"
            :opacity="0.8"
            :weight="1"
            fillColor="#ffc9c9"
            :fillOpacity="cell.opacity"
          />
        </l-layer-group>
      </l-map>
    </section>

    <sharing-list v-show="gameStep === 3" />
  </div>
</template>

<script>
import "leaflet";
import axios from "axios";
import { latLngBounds } from "leaflet";
import {
  LMap,
  LTileLayer,
  LMarker,
  LPolyline,
  LPolygon,
  LLayerGroup,
  LTooltip,
  LControl,
  LControlZoom,
  LIcon,
  LCircleMarker
} from "vue2-leaflet";

import UiButton from "./ui/UiButton";
import PopupModal from "./PopupModal";
import AppLoader from "./AppLoader";
import SectionHeader from "./SectionHeader";
import SharingList from "./SharingList";
import AnimationStartSlide from "./AnimationStartSlide";
import UserStationsInfo from "./UserStationsInfo";
import stations from "../assets/stations.json";
import { gsap } from "gsap";
import domtoimage from "dom-to-image";

export default {
  name: "LeafletMap",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPolyline,
    LPolygon,
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
    SharingList,
    AnimationStartSlide,
    UserStationsInfo
  },
  data() {
    return {
      urlForStatistics:
        "https://www.tut.by/stat/quiz?answ_num=0&id=1134&stat=1&answ_val=",
      showPasswordInput: false,
      gameStep: 1,
      latCount: 67,
      lngCount: 36,
      statisticsData: [],
      cellCoords: [],
      statisticsMaxValue: 0,
      inputParams: {},
      simpleMapScreenshoter: null,
      showLoader: false,
      mapScreenshot: "",
      markers: [],
      map: {
        data: [
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
            visible: true
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
            visible: true
          }
        ],
        minLat: 53.8,
        maxLat: 53.98,
        minLng: 27.38,
        maxLng: 27.849,
        latDelta: 0.005,
        lngDelta: 0.007,
        options: {
          zoomControl: false,
          attributionControl: false,
          zoomSnap: true
        },
        zoom: {
          value: 11,
          min: 11,
          max: 15
        },
        bounds: latLngBounds([
          [53.8, 27.38], // left-bottom
          [53.98, 27.849] // top-right
        ]),
        tileUrl:
          "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      },

      commentsBlock: null,
      userStationsCount: 14,
      iconSize: 20,
      iconAnchor: [20, 51],
      popup: {
        show: false,
        showButton: false,
        text: ""
      }
    };
  },

  methods: {
    showHotmap() {
      this.gameStep = 4;
    },
    showStat() {
      this.gameStep = -612479;
      this.showPasswordInput = false;
    },
    theAction() {
      this.showPasswstordInput = true;
    },
    moveUserMarkerHandler(event, markerId) {
      this.markers.forEach(el => {
        if (el.id === markerId) {
          el.cell = this.getCellNum(event.lat, event.lng);
        }
      });
    },

    closePopup(showResult) {
      this.popup.show = false;
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
      const comments = document.querySelector(".b-comments");
      if (!this.isNull(comments)) {
        const commentsBlock = document
          .querySelector(".b-comments")
          .innerHTML.trim();
        if (!this.isNull(commentsBlock)) {
          this.commentsBlock = commentsBlock;
        }
      }

      const node = document.getElementById("sharingImage");
      const that = this;
      domtoimage
        .toPng(node)
        .then(resultPng => {
          const [, base64Str] = resultPng.split(",");
          var myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

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
              console.log(result);
              that.handleResult(result);
            })
            .catch(error => console.log(error));
        })
        .catch(error => console.error("oops, something went wrong!", error));
    },

    canAddMarker(lat, lng) {
      return (
        lat >= this.map.minLat &&
        lat <= this.map.maxLat &&
        lng >= this.map.minLng &&
        lng <= this.map.maxLng
      );
    },

    getCellNum(lat, lng) {
      return (
        Math.floor((lng - this.map.minLng) / 0.007) +
        1 +
        Math.floor(36 - (lat - this.map.minLat) / 0.005) * 67
      );
    },

    addMarker(e) {
      const position = [e.latlng.lat, e.latlng.lng];

      if (this.canAddMarker(...position)) {
        const newMarker = {
          id: this.markers.length + 1,
          line: -1,
          position: position,
          cell: this.getCellNum(...position),
          active: true,
          draggable: true,
          visible: true,
          className: "user-marker"
        };
        this.markers.push(newMarker);
        if (this.markers.length === this.userStationsCount) {
          this.popup.text = this.inputParams.finalPopupText;
          this.popup.showButton = true;
          this.popup.show = true;
        }
      } else {
        this.popup.showButton = false;
        this.popup.text = "Нельзя ставить точки за пределами Минска!";
        this.popup.show = true;
      }
    },

    removeLast() {
      this.markers.pop();
    },

    showResults() {
      this.showLoader = true;
      this.gameStep = 3;
      const that = this;
      let resultRequests = [];

      this.markers.forEach(el => {
        let req = function() {
          return axios.get(`${that.urlForStatistics}${el.cell}`);
        };
        resultRequests.push(req());
      });

      axios.all(resultRequests).then(
        axios.spread(resp => {
          const data = resp.data.data;
          // that.statisticsData = Object.keys(data)
          //   .map(key => [+key, data[key]])
          //   .filter(el => !Number.isNaN(el[0]) && el[0] > 0);
          const total = that.lngCount * that.latCount + 1;

          for (let i = 0; i <= total; i++) {
            const val = data[i];
            that.statisticsData.push(val ? val : 0);
            if (that.statisticsMaxValue < val) that.statisticsMaxValue = val;
          }
          // that.statisticsData = Array.from(
          //   Array(this.latCount * this.lngCount + 1).keys()
          // ).map(el => (data[el] ? data[el] : 0));
          // that.statisticsMaxValue = Math.max(...that.statisticsData);
          that.statisticsData = that.statisticsData.map(
            el => el / that.statisticsMaxValue
          );
          that.cellCoords = that.getCellsCoords();

          setTimeout(() => that.getScreenShot(), 1000);
        })
      );
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

    getLine1Coords() {
      return this.getStations1Coords().map(el => el.position);
    },

    getLine2Coords() {
      return this.getStations2Coords().map(el => el.position);
    },

    getLine3Coords() {
      return this.getStations3Coords().map(el => el.position);
    },

    getUserLineCoords() {
      return this.markers.map(el => el.position);
    },

    isNull(val) {
      return typeof val === "object" && !val;
    },

    getCellsCoords() {
      return Array.from(Array(this.latCount * this.lngCount).keys()).map(
        el => ({
          id: el,
          coords: [
            [
              this.map.maxLat -
                this.map.latDelta * Math.floor(el / this.latCount),
              this.map.minLng + this.map.lngDelta * (el % this.latCount)
            ],
            [
              this.map.maxLat -
                this.map.latDelta * Math.floor(el / this.latCount),
              this.map.minLng + this.map.lngDelta * ((el % this.latCount) + 1)
            ],
            [
              this.map.maxLat -
                this.map.latDelta * (Math.floor(el / this.latCount) + 1),
              this.map.minLng + this.map.lngDelta * ((el % this.latCount) + 1)
            ],
            [
              this.map.maxLat -
                this.map.latDelta * (Math.floor(el / this.latCount) + 1),
              this.map.minLng + this.map.lngDelta * (el % this.latCount)
            ]
          ],
          opacity: this.statisticsData[el + 1]
        })
      );
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.inputParams = window.inputData;
      let sHeader = this.inputParams.startHeader;
      let sMeta = this.inputParams.startMeta;

      if (sHeader === undefined || sHeader.length === 0) {
        this.inputParams.startHeader = document
          .querySelector(".m_header h1")
          .innerText.trim();
      }
      if (sMeta === undefined || sMeta.length === 0) {
        this.inputParams.startMeta = document.querySelector(
          ".b-article-details"
        ).innerHTML;
      }

      this.runTonnelAnimation();
    });
  },
  computed: {
    latCoords() {
      return Array.from(Array(37).keys()).map(el => [
        { lat: this.map.minLat + this.map.latDelta * el, lng: this.map.minLng },
        { lat: this.map.minLat + this.map.latDelta * el, lng: this.map.maxLng }
      ]);
    },
    lngCoords() {
      // in js you can write
      return Array.from(Array(68).keys()).map(el => [
        { lat: this.map.minLat, lng: this.map.minLng + this.map.lngDelta * el },
        { lat: this.map.maxLat, lng: this.map.minLng + this.map.lngDelta * el }
      ]);

      // instead of

      // let arr = [];
      // for (let i = 0; i <= 67; i++) {
      //   const lng = this.map.minLng + this.map.lngDelta * i;
      //   arr.push([
      //     { lat: this.map.minLat, lng },
      //     { lat: this.map.maxLat, lng }
      //   ]);
      // }
      // return arr;
    },
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
  margin-top: 20px;
  display: flex;

  .button {
    width: 50%;
    padding: 0;

    &:first-child {
      margin-right: 5px;
    }
    &:last-child {
      margin-left: 5px;
    }
    &.green {
      background-color: #9fc226;
      color: #fff;
    }
  }
}
.game-results {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  margin-bottom: 20px;

  .result-map {
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
    img {
      width: 100%;
    }
    &.user-map {
      .user-map-wrapper {
        background-color: #f1f1f1;
      }
      img {
        width: 100%;
        height: 235px;
        object-fit: cover;
      }
    }

    &.gov-map {
      margin-top: 20px;
    }
  }
}
.game-results-buttons {
  .button {
    margin-top: 15px;
    &:first-child {
      margin-top: 0;
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
.section-finish {
  .button {
    width: 100%;
  }
}
.section-finish {
  .b-add_comments {
    margin-top: 20px;
  }
}

.app-section {
  .section-header {
    text-align: left;
    margin-bottom: 20px;

    .section-label {
      color: #808080;
      font-size: 13px;
      line-height: 18px;
      text-align: left;
      margin-bottom: 10px;
    }
    .section-meta {
      text-align: left;

      font-size: 13px;
      line-height: 18px;
      color: #808080;
      .b-article-details {
        margin: 0;
        padding: 0;
      }
      p {
        margin: 0;
        color: #808080;
        font-size: 13px;
        line-height: 18px;
      }
      a {
        color: #808080;
        text-decoration: none;
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
}
@media (min-width: 640px) {
  .section-finish {
    .b-add_comments {
      margin-top: 15px;
    }
  }
  .game-results {
    display: flex;
    flex-direction: row;
    .result-map {
      width: 50%;
      &:first-child {
        margin-right: 6px;
      }

      &:last-child {
        margin-left: 6px;
      }
      &.gov-map {
        margin-top: 0;
      }
    }
  }
  .game-results-buttons {
    .button {
      margin-top: 0;
    }
  }
}

@media (min-width: 481px) {
  html:not(.smart) {
    .app-section {
      .section-header {
        margin-bottom: 25px;
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
    .game-results {
      margin-top: 25px;
      margin-bottom: 30px;
    }
    .game-actions {
      margin-top: 25px;
      .button {
        &:first-child {
          margin-right: 10px;
        }
        &:last-child {
          margin-left: 10px;
        }
      }
    }
  }
}
</style>
