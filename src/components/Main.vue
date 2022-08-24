<template>
  <div
    :class="{ Main_ShowingRight: docSelected }"
    class="Main_Layout">
    <div class="Main_Body">
      <div class="Main_Top"></div>
      <div class="Main_Mid">
        <div class="Main_MidBox">
          <div class="Main_Header">
            <span class="Main_Logo">Observatório das Eleições nas Redes Sociais</span>
            <span class="Main_About">
              <v-btn text icon
                color="blue lighten-3"
                @click="dialogProcModel = true;">
                <v-icon>info</v-icon>
              </v-btn>
              <v-dialog
                v-model="dialogProcModel"
                max-width="500">
                <div class="D_Dialog">
                  <div class="Main_DialogTitle">Sobre</div>
                  <div class="Main_DialogText">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer lobortis rhoncus sapien, eget ultricies sapien imperdiet at. Donec tortor nisi, tempor non sagittis quis, elementum non arcu. Aenean efficitur ornare libero ac tristique. Sed ac quam sed ex efficitur dapibus. In lectus enim, laoreet eget eros ultrices, molestie placerat lectus. Sed lacinia, dui quis sollicitudin porttitor, erat velit dignissim ante, eleifend viverra diam lacus sollicitudin libero. Donec facilisis vel nisl at maximus. Aenean id viverra augue, vel suscipit ipsum. Quisque eget risus in nulla semper faucibus. Pellentesque nisl diam, dignissim vitae lorem vitae, tempor pulvinar metus. Nunc consequat quam quis massa molestie, in malesuada velit auctor. Nulla dapibus dictum bibendum. Vestibulum venenatis dignissim felis nec facilisis. Sed metus dolor, efficitur et egestas eget, suscipit sit amet tortor.</div>
                </div>
              </v-dialog>
            </span>
          </div>
          <div class="Main_MidFilter">
            <div class="Main_ChipSelect Space_Bottom">
              <template v-for="(cand, ix) in candidates">
                <BaseChip
                  class="Main_CandChip"
                  v-model="candidatesModel"
                  required
                  :value="cand"
                  @click="resolveCharts()">
                  <div v-if="cand.candidate_id > 0" class="Main_CandBox" >
                    <div class="Main_CandPhoto">
                      <img :src="getImageCand(cand)" class="Main_CandImg" alt="">
                    </div>
                    <div class="Main_CandLabel">{{ cand.name }}</div>
                  </div>
                  <div v-else class="Main_CandLabel">Todos</div>
                  </BaseChip>
              </template>
            </div>
            <div class="Main_ChipSelect Space_Bottom">
              <template v-for="(social, ix) in socials">
                <BaseChip
                  class="Main_CandChip"
                  v-model="socialsModel"
                  required
                  :value="social"
                  @click="resolveCharts()" />
              </template>
            </div>
            <div class="Main_DatePicker">

              <v-menu
                v-model="dateMenuStart"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="290px">
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="startDate"
                    label="Data início"
                    prepend-icon="event"
                    readonly
                    v-on="on" />
                </template>
                <v-date-picker v-model="startDate" @input="dateMenuStart = false" />
              </v-menu>

              <v-menu
                v-model="dateMenuEnd"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="290px">
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="endDate"
                    label="Data fim"
                    prepend-icon="event"
                    readonly
                    v-on="on" />
                </template>
                <v-date-picker v-model="endDate" @input="dateMenuEnd = false" />
              </v-menu>

              <v-btn rounded color="primary" dark @click="resolveCharts()">Aplicar</v-btn>

            </div>
          </div>
          <div v-if="loading" class="Main_LoadingCharts"></div>
          <div v-else-if="candidatesModel.candidate_id === -1" class="Main_MidCharts">
            <div class="Main_ChartContainer">
              <Highcharts
                :config="chart_likes_count"
                :counter="counter" />
              <div class="Main_SwitchBox">
                <div class="Main_SwitchLabel">Média por post</div>
                <v-switch
                  v-model="chart_likes_perPost"
                  :disabled="socialsModel === 'Instagram'"
                  single-line
                  hide-details
                  @change="resolve_likes_count()" />
              </div>
            </div>
            <div class="Main_ChartContainer">
              <Highcharts
                :config="chart_followers_count"
                :counter="counter" />
              <div class="Main_SwitchBox">
                <div class="Main_SwitchLabel">Percentual</div>
                <v-switch
                  v-model="chart_followers_relative"
                  single-line
                  hide-details
                  @change="resolve_followers_count()" />
              </div>
            </div>
            <div class="Main_ChartContainer">
              <Highcharts
                :config="chart_thrid"
                :counter="counter" />
            </div>
            <div class="Main_ChartContainer">
              <Highcharts
                :config="chart_post_count"
                :counter="counter" />
            </div>
            <div class="Main_ChartContainer">
              <Highcharts
                :config="chart_ranking"
                :counter="counter" />
            </div>
          </div>
          <div v-else class="Main_MidCharts">
            <div class="Main_ChartContainer">
              <Highcharts
                :config="chart_candidate_hashtags"
                :counter="counter" />
            </div>
            <div class="Main_ChartContainer">
              <Highcharts
                :config="chart_candidate_topics"
                :counter="counter" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import BaseDialog from './BaseDialog.vue'
import dados from '../database/dados.json'
import Highcharts from './Highcharts.vue'
import BaseChip from './BaseChip.vue'

export default {
  name: 'Main',
  components: {
    Highcharts,
    BaseChip
  },
  props: {
    test: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dados: dados,
      chart_followers_count: {},
      chart_followers_relative: false,
      chart_likes_count: {},
      chart_likes_perPost: false,
      chart_thrid: {},
      chart_post_count: {},
      chart_ranking: {},
      chart_candidate_hashtags: {},
      chart_candidate_topics: {},
      loading: false,
      docSelected: null,
      counter: 0,
      candidatesModel: null,
      candidates: [
        { candidate_id: -1, name: "Todos" },
        { candidate_id: 12, name: "Ciro" },
        { candidate_id: 13, name: "Lula" },
        { candidate_id: 22, name: "Bolsonaro" },
        { candidate_id: 15, name: "Tebet" },
        { candidate_id: 30, name: "Felipe" }
      ],
      socialsModel: "Instagram",
      socials: [
        "Instagram",
        "Twitter"
      ],
      dateMenuStart: false,
      startDate: null,
      dateMenuEnd: false,
      endDate: null,
      dialogProcModel: false
    }
  },
  watch: {},
  beforeMount() {
    this.candidatesModel = this.candidates[0]
    this.resolveCharts();

  },
  mounted() {},
  computed: {},
  methods: {
    resolveCharts() {
      this.loading = true;
      if (this.candidatesModel.candidate_id === -1) {
        // chart geral
        this.resolve_followers_count();
        this.resolve_likes_count();
        this.resolve_thrid();
        this.resolve_post_count();
        this.resolve_ranking();
      } else {
        // chart específico
        this.resolve_candidate_hashtags();
        this.resolve_candidate_topics();
      }

      this.$nextTick().then(() => {
        this.loading = false;
      })  
    },
    resolve_followers_count() {
      
      let property = "followers_count";
      if (this.chart_followers_relative) property = "followers_relative";
      
      axios.get(Vue.preUrl + `/report/followers_count?media=${this.socialsModel.toLowerCase()}&start=${this.startDate}&end=${this.endDate}`)
      .then(res => {
        this.chart_followers_count = this.prepareChartLine(res.data, property, "Ganho de seguidores")
      })
      .catch(error => {
        this.chart_followers_count = {}
        console.log(error);
      });
      
    },
    resolve_likes_count() {
      if (this.socialsModel === "Instagram") this.chart_likes_perPost = true;

      let property = "likes_count";
      if (this.chart_likes_perPost) property = "likes_by_post";

      axios.get(Vue.preUrl + `/report/likes_count?media=${this.socialsModel.toLowerCase()}&start=${this.startDate}&end=${this.endDate}`)
      .then(res => {
        this.chart_likes_count = this.prepareChartLine(res.data, property, "Número de likes")
      })
      .catch(error => {
        this.chart_likes_count = {}
        console.log(error);
      });

    },
    resolve_thrid() {

      let urlpos = `/report/retweets_count?start=${this.startDate}&end=${this.endDate}`;
      let property = "retweets";
      let title = "Número de retweets";
      if (this.socialsModel === "Instagram") {
        urlpos = `/report/insta_comments_count?start=${this.startDate}&end=${this.endDate}`;
        property = "comments_by_post";
        title = "Número de comentários";
      }

      axios.get(Vue.preUrl + urlpos)
      .then(res => {
        this.chart_thrid = this.prepareChartLine(res.data, property, title)
      })
      .catch(error => {
        this.chart_thrid = {}
        console.log(error);
      });
      
    },
    resolve_post_count() {

      axios.get(Vue.preUrl + `/report/posts_count?media=${this.socialsModel.toLowerCase()}&start=${this.startDate}&end=${this.endDate}`)
      .then(res => {
        this.chart_post_count = this.prepareChartLine(res.data, "posts_count", "Número de posts")
      })
      .catch(error => {
        this.chart_post_count = {}
        console.log(error);
      });

    },
    resolve_ranking() {

      axios.get(Vue.preUrl + `/report/candidate_ranking?media=${this.socialsModel.toLowerCase()}&start=${this.startDate}&end=${this.endDate}`)
      .then(res => {
        this.chart_ranking = this.prepareRanking(res.data[0], "Ranking")
      })
      .catch(error => {
        this.chart_ranking = {}
        console.log(error);
      });

    },
    resolve_candidate_hashtags() {

      axios.get(Vue.preUrl + `/report/candidate_hashtags?media=${this.socialsModel.toLowerCase()}&start=${this.startDate}&end=${this.endDate}`)
      .then(res => {
        this.chart_candidate_hashtags = this.prepareChartCloud(res.data, "hashtags", "Hashtags usadas")
      })
      .catch(error => {
        this.chart_candidate_hashtags = {}
        console.log(error);
      });

    },
    resolve_candidate_topics() {

      axios.get(Vue.preUrl + `/report/candidate_topics?media=${this.socialsModel.toLowerCase()}&start=${this.startDate}&end=${this.endDate}`)
      .then(res => {
        this.chart_candidate_topics = this.prepareChartCloud(res.data, "topics", "Tópicos citados")
      })
      .catch(error => {
        this.chart_candidate_topics = {}
        console.log(error);
      });

    },
    prepareChartLine(arrDados, yItem, title) {
      let series = [];
      let vm = this;
      let xAxisArray = [];

      arrDados.map(x => {
        let alreadyItem = xAxisArray.find(y => y === Date.parse(x.date+"T00:00"));
        if (!alreadyItem) {
          xAxisArray.push(Date.parse(x.date+"T00:00"));
        }
      })
      xAxisArray.sort();
      xAxisArray = xAxisArray.map(x => (new Date(x)).toLocaleDateString("pt-br").substr(0,5));

      arrDados.map((x, ix) => {
        let inSeries = series.find(y => {
          let name = `${ vm.candidates.find(z => {
            return z.candidate_id === x.candidate; 
          }).name }`
          return y.name === name;
        })
        if (!inSeries) {
          series.push({ name: `${ vm.candidates.find(z => {
            return z.candidate_id === x.candidate; 
          }).name }` });
          inSeries = series[series.length-1]
        }
        if (!inSeries.data) {
          inSeries.data = [];
        }
        inSeries.data.push({
            x: xAxisArray.findIndex(t => t === (new Date(Date.parse(x.date+"T00:00"))).toLocaleDateString("pt-br").substr(0,5) ),
            y: Number(x[yItem])
        })
      })

      series.sort((a, b) => a.name.localeCompare(b.name));


      // if (yItem === "followers_count") {
      //   series.map(x => {
      //       let start = 0;
      //       x.data.sort((a, b) => a.y - b.y);
      //       x.data.map((item, ix) => {
      //         if (ix === 0) {
      //           start = item.y;
      //           item.y = 0;
      //         } else {
      //           item.y = item.y - start;
      //         }
      //       })
      //   })
      //   console.log("o", series);
      // }


      return {
        series,
        title: {
          text: title
        },
        xAxis: {
          type: "category",
          categories: xAxisArray
        }
      }
    },
    prepareChartCloud(arrDados, chave, title) {
      let series = [];
      let vm = this;
      let dataList = [];
      let xAxisArray = [];

      


      let cand = arrDados.find(x => {
        return x.name === this.candidatesModel.name
      })
      console.log(cand);
      if (cand) {

        Object.keys( cand[chave] ).forEach(function (key) {
          dataList.push({
            name: key,
            y: cand[chave][key]
          })
        });

        dataList.sort((a, b) => b.y - a.y)


        series.push({
          type: 'bar',
          data: dataList,
          name: 'Ocorrências'
        })
      }

      return {
        chart: {
          marginLeft: 200,
        },
        series,
        title: {
          text: title
        },
        xAxis: {
          type: "category",
          categories: dataList.map(x => x.name),
          labels: {
              useHTML: false,//set to true
              style:{
                  width:'50px',
                  whiteSpace:'normal'//set to normal
              },
          },
        },
        plotOptions: {
          bar: {
            colorByPoint: false
          }
        },
        legend: {
          enabled: false
        }
      }
    },
    prepareRanking(arrDados, title) {
      let series = [];
      let vm = this;
      let dataList = [];
      let xAxisArray = [];
      let categories = [];


      Object.keys( arrDados ).forEach(function (topic) {
        categories.push(topic);
        Object.keys( arrDados[topic] ).forEach(function (cand) {
          let alreadyItem = series.find(x => x.name === cand);
          if (alreadyItem) {
            alreadyItem.data.push(arrDados[topic][cand]);
          } else {
            series.push({
              type: 'column',
              name: cand,
              data: [arrDados[topic][cand]]
            })
          }
        })
      });

      series.sort((a, b) => a.name.localeCompare(b.name));

      return {
        series,
        title: {
          text: title
        },
        xAxis: {
          type: "category",
          categories: categories,
        },
        plotOptions: {
          bar: {
            colorByPoint: false
          }
        },
        legend: {
          enabled: true
        }
      }
    },
    openDetail(e) {
      // console.log(e);
      if (this.docSelected === null) {
        this.counter++;
      }
      this.docSelected = {
        documento: e.name,
        cluster: e.series.name,
        x: e.x,
        y: e.y
      }
    },
    getImageCand(cand) {
      return require('@/assets/' + cand.name + '.png')
    }
  },
}
</script>

<style>
* {
  background-repeat: no-repeat;
  padding: 0;
  margin: 0;
}
html, body {
  width: 100%;
  height: 100%;
}
body {
  font-family: 'Roboto', sans-serif;

  --d-back: #fff;
  --d-text: #333;

  --d-back: #333;
  --d-text: #ccc;

  --top-height: 0px;
  --left-width: 270px;
  --right-width: 300px;
  --mid-max-width: 1200px;

  font-size: 18px;
  background-color: var(--d-back);
  color: var(--d-text);

}
.Main_Layout {
  min-height: 100%;
  max-height: 100%;
  max-width: 100%;
  display: flex;
  -webkit-user-select: none;
}
.Main_Body {
  position: relative;
  min-height: 100%;
  max-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.Main_Top {
  height: var(--top-height);
  /* background-color: #1c1c1c;
  box-shadow: inset 0px -2px 0px 0px #2a2a2a; */
  display: flex;
  align-items: center;
  padding: 0 10px;
}
.Main_MidFilter {
  margin-bottom: 70px;
}
.Main_Mid {
  flex-grow: 1;
  display: flex;
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  height: calc(100% - var(--top-height));
  max-height: calc(100% - var(--top-height));
}
.Main_MidBox {  
  width: 100%;
  max-width: var(--mid-max-width);
}
.Main_ChipSelect {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
}
.Main_CandChip {

}
.Main_CandChipActive {

}
.Main_CandBox {
  display: flex;
  align-items: center;
}
.Main_CandPhoto {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 5px;
}
.Main_CandImg {
  width: 100%;
}
.Main_CandLabel {
  padding: 0 7px;
}
.Space_Bottom { 
  margin-bottom: 20px;
}
.Space_Top { 
  margin-top: 20px;
}
.Space_Both { 
  margin-bottom: 20px;
  margin-top: 20px;
}
.Main_ChartContainer + .Main_ChartContainer {
  margin-top: 70px;
}
.Main_MidCharts {
  padding-bottom: 70px;
}
.Main_ChartContainer {
  display: flex;
  align-items: center;
}
.Main_SwitchBox {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background-color: rgba(255,255,255,0.05);
  border-radius: 10px;
}
.Main_SwitchLabel {
  font-size: 14px;
  text-align: center;
}
.Main_DatePicker {
  display: flex;
  max-width: 500px;
  margin: 0 auto;
  gap: 30px;
  align-items: center;
}
.D_Dialog {
  background-color: #383838;
  padding: 20px;
}
.Main_Header {
  display: block;
  text-align: center;
  line-height: 1.0;
  padding: 10px;
  margin: 30px 0;
  color: #67bcff;
  font-size: 24px;
  font-weight: bold;
}
.Main_DialogTitle {
  font-size: 1.5em;
  margin-bottom: 20px;
}
.Main_DialogText {

}



textarea::-webkit-scrollbar,
.DarkScroll::-webkit-scrollbar,
html::-webkit-scrollbar {
  width: 18px;
}
textarea::-webkit-scrollbar-track,
.DarkScroll::-webkit-scrollbar-track,
html::-webkit-scrollbar-track {
  background-color: #0002;
}
textarea::-webkit-scrollbar-thumb,
.DarkScroll::-webkit-scrollbar-thumb,
html::-webkit-scrollbar-thumb {
  background-color: #555;
}
textarea::-webkit-scrollbar-corner,
.DarkScroll::-webkit-scrollbar-corner,
html::-webkit-scrollbar-corner {
  background-color: #222;
}

/* VUETIFY FIX */
.App_Layout .theme--dark.v-btn:focus:before {
  opacity: 0;
}
.App_Layout .theme--dark.v-btn.focus-visible:before {
  opacity: 0.24;
}
.primary {
  background-color: #1976d2 !important;
  border-color: #1976d2 !important;
}
.primary--text {
  color: #5cbbf6!important;
  caret-color: #5cbbf6!important;
}
.Main_Layout .v-input--selection-controls {
  margin-top: 0px;
}
.theme--dark.v-application {
  background: unset !important;
  color: unset !important;
}
.v-application .accent {
  background-color: #006fc7 !important;
  border-color: #0079b5 !important;
}
.v-application .accent--text {
  color: #006fc7 !important;
  caret-color: #006fc7 !important;
}
</style>