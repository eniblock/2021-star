import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { EChartsOption } from 'echarts';

export interface Point {
  x: number;
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

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.makeEchartsData();
  }

  private makeEchartsData() {
    if (this.graphData != null) {
      const data = this.graphData;

      let echartsData: EChartsOption = {
        tooltip: {
          trigger: 'axis',
          formatter: function (params: any, ticket: any, callback: any) {
            let res = '';
            for (let i = 0; i < params.length; i++) {
              let p = params[i];
              res = i > 0 ? '<br/>' : '';
              if (p.seriesName != null && p.seriesName != '') {
                res += p.marker + p.seriesName + ' = ' + p.value[1];
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
              title: 'enregistrer',
              name: data.exportFileName
                .replace(/[^a-z0-9\-]/gi, '_')
                .toLowerCase(),
            },
          },
        },
        xAxis: {
          type: 'value',
          name: data.xTitle,
          nameLocation: 'middle',
          nameGap: 35,
          splitLine: { show: false },
        },
        yAxis: {
          type: 'value',
          name: data.yTitle,
          nameLocation: 'middle',
          nameGap: 35,
          nameTextStyle: { fontWeight: 'bold' }, // fontSize:14
          axisPointer: { snap: true },
          splitLine: { show: false },
        },
        legend: {
          data: data.serieNames,
        },
        series: [
          {
            name: 'aaa',
            type: 'line',
            symbolSize: 10,
            smooth: false,
            symbol: 'circle',
            lineStyle: {
              type: 'solid',
            },
            data: [
              [15, 0],
              [-50, 10],
              [-56.5, 20],
              [-46.5, 30],
              [-22.1, 40],
            ],
          },
        ],
        dataZoom: [
          {
            type: 'inside',
            show: true,
            filterMode: 'none',
          },
        ],
      };

      this.echartsData = echartsData;
    }
  }
}
