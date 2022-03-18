import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SquareGraphComponent } from './square-graph/square-graph.component';
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  imports: [
    CommonModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
  ],
  exports: [SquareGraphComponent],
  declarations: [SquareGraphComponent],
})
export class GraphModule {}
