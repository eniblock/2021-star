import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormReseauRechercheComponent } from './form-reseau-recherche/form-reseau-recherche.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { FormOrdreDebutLimitationComponent } from './form-ordre-debut-limitation/form-ordre-debut-limitation.component';
import { FormOrdreFinLimitationComponent } from './form-ordre-fin-limitation/form-ordre-fin-limitation.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    PipesModule,
  ],
  declarations: [
    FormReseauRechercheComponent,
    FormOrdreDebutLimitationComponent,
    FormOrdreFinLimitationComponent,
  ],
  exports: [
    FormReseauRechercheComponent,
    FormOrdreDebutLimitationComponent,
    FormOrdreFinLimitationComponent,
  ],
})
export class FormulairesModule {}
