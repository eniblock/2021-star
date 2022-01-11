import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccueilRoutes } from './accueil.routing';
import { AccueilComponent } from './accueil.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [CommonModule, AccueilRoutes, MatButtonModule],
  declarations: [AccueilComponent],
})
export class HomeModule {}
