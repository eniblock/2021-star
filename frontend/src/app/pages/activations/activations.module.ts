import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivationsComponent } from './activations.component';
import { ActivationsRoutes } from './activations.routing';
import { FormulairesModule } from 'src/app/components/formulaires/formulaires.module';

@NgModule({
  imports: [CommonModule, ActivationsRoutes, FormulairesModule],
  declarations: [ActivationsComponent],
})
export class ActivationsModule {}
