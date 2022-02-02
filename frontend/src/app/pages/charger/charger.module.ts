import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChargerComponent } from './charger.component';
import { ChargerRoutes } from './charger.routing';
import { MatSelectModule } from '@angular/material/select';
import { FormulairesModule } from 'src/app/components/formulaires/formulaires.module';

@NgModule({
  imports: [CommonModule, ChargerRoutes, MatSelectModule, FormulairesModule],
  declarations: [ChargerComponent],
})
export class ChargerModule {}
