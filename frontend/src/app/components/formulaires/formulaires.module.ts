import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TechnologyTypePipe } from 'src/app/pipes/TechnologyType.pipe';
import { TypeDeRechercheSimplePipe } from 'src/app/pipes/TypeDeRechercheSimple.pipe';
import { ReseauRechercheComponent } from './reseau-recherche/reseau-recherche.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  declarations: [
    ReseauRechercheComponent,
    TechnologyTypePipe,
    TypeDeRechercheSimplePipe,
  ],
  exports: [ReseauRechercheComponent],
})
export class FormulairesModule {}
