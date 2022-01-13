import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChargerComponent } from './charger.component';
import { ChargerRoutes } from './charger.routing';

@NgModule({
  imports: [CommonModule, ChargerRoutes],
  declarations: [ChargerComponent],
})
export class ChargerModule {}
