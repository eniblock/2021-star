import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReseauComponent } from './reseau.component';
import { ReseauRoutes } from './reseau.routing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ReseauPaginationComponent } from './reseau-pagination/reseau-pagination.component';
import { ReseauRechercheComponent } from './reseau-recherche/reseau-recherche.component';
import { ReseauResultatsComponent } from './reseau-resultats/reseau-resultats.component';
import { TechnologyTypePipe } from 'src/app/pipes/TechnologyType.pipe';
import { ChampDeRechercheReseauSimplePipe } from 'src/app/pipes/ChampDeRechercheReseauSimple.pipe';

@NgModule({
  imports: [
    CommonModule,
    ReseauRoutes,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  declarations: [
    ReseauComponent,
    ReseauPaginationComponent,
    ReseauRechercheComponent,
    ReseauResultatsComponent,
    TechnologyTypePipe,
    ChampDeRechercheReseauSimplePipe,
  ],
})
export class ReseauModule {}
