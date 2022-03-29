import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SquareGraphComponent } from './square-graph/square-graph.component';
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  imports: [
    CommonModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
  ],
  providers: [DatePipe],
  exports: [SquareGraphComponent],
  declarations: [SquareGraphComponent],
})
export class GraphModule {}
