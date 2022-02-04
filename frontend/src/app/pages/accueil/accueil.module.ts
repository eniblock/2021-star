import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccueilRoutes } from './accueil.routing';
import { AccueilComponent } from './accueil.component';
import { MatButtonModule } from '@angular/material/button';
import { FormulairesModule } from 'src/app/components/formulaires/formulaires.module';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    AccueilRoutes,
    FormulairesModule,
    MatButtonModule,
    MatDividerModule,
  ],
  declarations: [AccueilComponent],
})
export class HomeModule {}
