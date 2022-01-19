import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReseauComponent } from './reseau.component';
import { ReseauRoutes } from './reseau.routing';
import { ReseauPaginationComponent } from './reseau-pagination/reseau-pagination.component';
import { ReseauResultatsComponent } from './reseau-resultats/reseau-resultats.component';
import { FormulairesModule } from 'src/app/components/formulaires/formulaires.module';

@NgModule({
  imports: [CommonModule, ReseauRoutes, FormulairesModule],
  declarations: [
    ReseauComponent,
    ReseauPaginationComponent,
    ReseauResultatsComponent,
  ],
})
export class ReseauModule {}
