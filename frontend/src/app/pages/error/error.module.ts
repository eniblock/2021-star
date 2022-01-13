import { ErrorRoutes } from './error.routing';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from './error.component';

@NgModule({
  imports: [CommonModule, ErrorRoutes],
  declarations: [ErrorComponent],
})
export class ErrorModule {}
