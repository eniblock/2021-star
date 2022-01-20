import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReseauComponent } from './reseau.component';
import { ReseauRoutes } from './reseau.routing';
import { ReseauPaginationComponent } from './reseau-pagination/reseau-pagination.component';
import { ReseauResultatsComponent } from './reseau-resultats/reseau-resultats.component';
import { FormulairesModule } from 'src/app/components/formulaires/formulaires.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { OrdreRechercheReseauPipe } from 'src/app/pipes/OrdreRechercheReseau.pipe';

@NgModule({
  imports: [
    CommonModule,
    ReseauRoutes,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    FormulairesModule,
  ],
  declarations: [
    OrdreRechercheReseauPipe,
    ReseauComponent,
    ReseauPaginationComponent,
    ReseauResultatsComponent,
  ],
})
export class ReseauModule {}
