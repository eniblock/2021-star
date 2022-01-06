import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccueilRoutes } from './accueil.routing';
import { AccueilComponent } from './accueil.component';

@NgModule({
  imports: [CommonModule, AccueilRoutes],
  declarations: [AccueilComponent],
})
export class HomeModule {}
