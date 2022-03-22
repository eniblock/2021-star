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
  data: Point[][];
  exportFileName: string;
}

/* GraphData exemple :
{
  yTitle: 'Puissance (MW)',
  serieNames: ['Référence', 'Consigne'],
  data: [
    [
      { x: new Date('2015/04/29 11:24:00').getTime(), y: 8 },
      { x: new Date('2015/04/29 11:28:00').getTime(), y: 4 },
      { x: new Date('2015/04/29 12:24:00').getTime(), y: 3 },
      { x: new Date('2015/04/29 13:00:00').getTime(), y: 3 },
    ],
    [
      { x: new Date('2015/04/29 11:24:00').getTime(), y: 1 },
      { x: new Date('2015/04/29 11:29:00').getTime(), y: 2 },
      { x: new Date('2015/04/29 11:50:00').getTime(), y: 2 },
      { x: new Date('2015/04/29 12:10:00').getTime(), y: 1 },
      { x: new Date('2015/04/29 12:15:00').getTime(), y: 7 },
      { x: new Date('2015/04/29 14:00:00').getTime(), y: 7 },
    ],
  ],
  exportFileName: 'monFichier',
}
*/

export const jsonDateToValueX = (jsonDate: string) =>
  new Date(jsonDate).getTime();

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
    if (
      this.graphData != null &&
      this.graphData.data != null &&
      this.graphData.data.length > 0
    ) {
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

      // Remove unsed points
      graphData.data.forEach((serie, indice) => {
        graphData.data[indice] = serie.reduce(
          (acc: Point[], val: Point, index: number) =>
            acc.length == 0 ||
            val.y != acc[acc.length - 1].y ||
            index == serie.length - 1
              ? [...acc, val]
              : acc,
          []
        );
      });

      // We init Echarts data
      let echartsData: EChartsOption = {
        tooltip: {
          show: true,
          trigger: 'axis',
          formatter: function (params: any, ticket: any, callback: any) {
            let res =
              datepipe.transform(
                new Date(params[0].axisValue),
                'dd/MM/yyyy HH:mm:ss'
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
              if (value > 0) {
                return (
                  datepipe.transform(new Date(value), 'dd/MM') +
                  '\n' +
                  datepipe.transform(new Date(value), 'HH:mm')
                );
              } else {
                return '';
              }
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
        (echartsData.series as any).push({
          name: graphData.serieNames[indice],
          type: 'line',
          symbol: 'none',
          symbolSize: 5,
          step: 'end',
          smooth: false,
          data: serie.map((p) => [p.x, p.y]),
        });
      });

      this.echartsData = echartsData;
    }
  }
}
