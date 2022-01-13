import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivationsComponent } from './activations.component';
import { ActivationsRoutes } from './activations.routing';

@NgModule({
  imports: [CommonModule, ActivationsRoutes],
  declarations: [ActivationsComponent],
})
export class ActivationsModule {}
