<template>
  <div
    :class="{ Main_ShowingRight: docSelected }"
    class="Main_Layout">
    <div class="Main_Body">
      <div class="Main_Top"></div>
      <div class="Main_Mid">
        <div class="Main_MidBox">
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
          </div>
          <div v-if="loading" class="Main_LoadingCharts"></div>
          <div v-else-if="candidatesModel.candidate_id === -1" class="Main_MidCharts">
            <div class="Main_ChartContainer">
              <Highcharts
                :config="chart_twitter_followers_count"
                :counter="counter" />
            </div>
            <div class="Main_ChartContainer">
              <Highcharts
                :config="chart_twitter_likes_count"
                :counter="counter" />
            </div>
            <div class="Main_ChartContainer">
              <Highcharts
                :config="chart_retweets_count"
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
      chart_twitter_followers_count: {},
      chart_twitter_likes_count: {},
      chart_retweets_count: {},
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
      ],
      socialsModel: "Twitter",
      socials: [
        "Twitter",
        "Instagram"
      ]
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
        this.resolve_twitter_followers_count();
        this.resolve_twitter_likes_count();
        this.resolve_retweets_count();
      } else {
        // chart específico
        this.resolve_candidate_hashtags();
        this.resolve_candidate_topics();
      }

      setTimeout(() => {
        this.loading = false;
      }, 0);
    },
    resolve_twitter_followers_count() {
      this.chart_twitter_followers_count = this.prepareChartLine(this.dados.twitter_followers_count, "followers_count", "Ganho de seguidores Twitter")
    },
    resolve_twitter_likes_count() {
      this.chart_twitter_likes_count = this.prepareChartLine(this.dados.twitter_likes_count, "likes", "Número de likes Twitter")
    },
    resolve_retweets_count() {
      this.chart_retweets_count = this.prepareChartLine(this.dados.retweets_count, "retweets", "Número de retweets")
    },
    resolve_candidate_hashtags() {
      this.chart_candidate_hashtags = this.prepareChartCloud(this.dados.candidate_hashtags, "hashtags", "Hashtags usadas")
    },
    resolve_candidate_topics() {
      this.chart_candidate_topics = this.prepareChartCloud(this.dados.candidate_topics, "topics", "Tópicos citados")
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
            name: "Total: " + x[yItem].toLocaleString("pt-br"),
            x: xAxisArray.findIndex(t => t === (new Date(Date.parse(x.date+"T00:00"))).toLocaleDateString("pt-br").substr(0,5) ),
            y: x[yItem]
        })
      })

      series.sort((a, b) => a.name.localeCompare(b.name));


      if (yItem === "followers_count") {
        series.map(x => {
            let start = 0;
            x.data.sort((a, b) => a.y - b.y);
            x.data.map((item, ix) => {
              if (ix === 0) {
                start = item.y;
                item.y = 0;
              } else {
                item.y = item.y - start;
              }
            })
        })
        console.log("o", series);
      }


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

  --top-height: 40px;
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
</style>