import { DatePipe } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { EChartsOption } from 'echarts';

export interface Point {
  x: number; // timestamp
  y: number;
}

export interface GraphData {
  xTitle?: string;
  yTitle?: string;
  serieNames: string[];
  data: Point[][] /* Ex :
                          [
                            [{x:1, y:8}, {x:3, y:2}, {x:4, y:3}],
                            [{x:1, y:1}, {x:12, y:2}, {x:15, y:2}]
                          ]
                  */;
  exportFileName: string;
}

@Component({
  selector: 'app-square-graph',
  templateUrl: './square-graph.component.html',
  styleUrls: ['./square-graph.component.css'],
})
export class SquareGraphComponent implements OnInit, OnChanges {
  @Input() graphData?: GraphData;

  echartsData: EChartsOption = {};

  constructor(public datepipe: DatePipe) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.makeEchartsData();
  }

  private makeEchartsData() {
    if (this.graphData != null) {
      const datepipe = this.datepipe;
      const graphData = this.graphData;

      // Searching maximum and minimum timestamp (x-axis)
      let minTimestamp = Number.MAX_SAFE_INTEGER;
      let maxTimestamp = Number.MIN_SAFE_INTEGER;
      const xMin = graphData.data.forEach((serie) => {
        if (serie.length > 0 && serie[0].x < minTimestamp) {
          minTimestamp = serie[0].x;
        }
        if (serie.length > 0 && serie[serie.length - 1].x > maxTimestamp) {
          maxTimestamp = serie[serie.length - 1].x;
        }
      });

      // Graph points wrt graphData
      graphData.data.forEach((serie, indice) => {
        let graphPoints: Point[] = [];
        if (serie.length > 0 && serie[0].x != minTimestamp) {
          graphPoints.push({ x: minTimestamp, y: serie[0].y });
        }
        graphPoints = graphPoints.concat(serie);
        if (serie.length > 0 && serie[serie.length - 1].x != maxTimestamp) {
          graphPoints.push({ x: maxTimestamp, y: serie[serie.length - 1].y });
        }
        graphData.data[indice] = graphPoints;
      });

      // We init Echarts data
      let echartsData: EChartsOption = {
        tooltip: {
          trigger: 'axis',
          formatter: function (params: any, ticket: any, callback: any) {
            let res =
              datepipe.transform(
                new Date(params[0].axisValue * 1000),
                'dd/MM/yyyy hh:mm:ss'
              ) + '<br/>';
            for (let i = 0; i < params.length; i++) {
              let p = params[i];
              res += i > 0 ? '<br/>' : '';
              if (p.seriesName != null && p.seriesName != '') {
                res += p.marker + p.seriesName + ' : ' + p.value[1];
              } else {
                res += p.marker + p.value[1];
              }
            }
            return res;
          } as any,
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              title: 'enregistrer             ',
              name: graphData.exportFileName
                .replace(/[^a-z0-9\-]/gi, '_')
                .toLowerCase(),
            },
          },
        },
        xAxis: {
          type: 'value',
          //////////////minInterval: 1,
          min: minTimestamp,
          max: maxTimestamp,
          name: graphData.xTitle,
          nameLocation: 'middle',
          nameGap: 35,
          axisLabel: {
            formatter: function (value: any, index: any) {
              return (
                datepipe.transform(new Date(value * 1000), 'dd/MM') +
                '\n' +
                datepipe.transform(new Date(value * 1000), 'hh:mm')
              );
            },
          },

          splitLine: { show: false },
        },
        yAxis: {
          type: 'value',
          name: graphData.yTitle,
          nameLocation: 'middle',
          nameGap: 35,
          nameTextStyle: { fontWeight: 'bold' }, // fontSize:14
          axisPointer: { snap: true },
          splitLine: { show: false },
        },
        legend: {
          data: graphData.serieNames,
        },
        series: [],
        dataZoom: [
          {
            type: 'inside',
            show: true,
            filterMode: 'none',
          },
        ],
      };

      // We add data
      graphData.data.forEach((serie, indice) => {
        let squareSerie = [];
        if (serie.length >= 1) {
          const p = serie[0];
          squareSerie.push([p.x, p.y]);
        }
        for (let i = 1; i < serie.length; i++) {
          const p_1 = serie[i - 1];
          const p = serie[i];
          if (p.y != p_1.y || i == serie.length - 1) {
            squareSerie.push([p.x, p_1.y]);
            squareSerie.push([p.x, p.y]);
          }
        }
        (echartsData.series as any).push({
          name: graphData.serieNames[indice],
          type: 'line',
          symbolSize: 10,
          smooth: false,
          data: squareSerie,
        });
      });

      this.echartsData = echartsData;
    }
  }
}
