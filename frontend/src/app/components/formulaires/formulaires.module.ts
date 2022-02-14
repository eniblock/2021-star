import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
<<<<<<< HEAD
import { FormReseauRechercheComponent } from './form-reseau-recherche/form-reseau-recherche.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { FormOrdreDebutLimitationComponent } from './form-ordre-debut-limitation/form-ordre-debut-limitation.component';
import { FormOrdreFinLimitationComponent } from './form-ordre-fin-limitation/form-ordre-fin-limitation.component';
import { MicroComponentsModule } from '../micro-components/micro-components.module';
import { FormOrdreFinLimitationFichierComponent } from './form-ordre-fin-limitation/form-ordre-fin-limitation-fichier/form-ordre-fin-limitation-fichier.component';
import { FormOrdreFinLimitationSaisieManuelleComponent } from './form-ordre-fin-limitation/form-ordre-fin-limitation-saisie-manuelle/form-ordre-fin-limitation-saisie-manuelle.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
=======
import { ReseauRechercheComponent } from './reseau-recherche/reseau-recherche.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
>>>>>>> develop

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
<<<<<<< HEAD
    MicroComponentsModule,
=======
>>>>>>> develop
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    PipesModule,
<<<<<<< HEAD
    MatRadioModule,
    MatStepperModule,
    MatDatepickerModule,
  ],
  declarations: [
    FormReseauRechercheComponent,
    FormOrdreDebutLimitationComponent,
    FormOrdreFinLimitationComponent,
    FormOrdreFinLimitationFichierComponent,
    FormOrdreFinLimitationSaisieManuelleComponent,
  ],
  exports: [
    FormReseauRechercheComponent,
    FormOrdreDebutLimitationComponent,
    FormOrdreFinLimitationComponent,
  ],
=======
  ],
  declarations: [ReseauRechercheComponent],
  exports: [ReseauRechercheComponent],
>>>>>>> develop
})
export class FormulairesModule {}
