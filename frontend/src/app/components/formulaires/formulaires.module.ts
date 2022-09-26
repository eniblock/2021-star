import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormSitesProductionRechercheComponent } from './form-sites-production-recherche/form-sites-production-recherche.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { FormOrdreDebutLimitationComponent } from './form-ordre-debut-limitation/form-ordre-debut-limitation.component';
import { FormOrdreFinLimitationComponent } from './form-ordre-fin-limitation/form-ordre-fin-limitation.component';
import { MicroComponentsModule } from '../micro-components/micro-components.module';
import { FormOrdreFinLimitationFichierComponent } from './form-ordre-fin-limitation/form-ordre-fin-limitation-fichier/form-ordre-fin-limitation-fichier.component';
import { FormOrdreFinLimitationSaisieManuelleComponent } from './form-ordre-fin-limitation/form-ordre-fin-limitation-saisie-manuelle/form-ordre-fin-limitation-saisie-manuelle.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormLimitationsRechercheComponent } from './form-limitations-recherche/form-limitations-recherche.component';
import { FormOrdreDebutEtFinLimitationComponent } from './form-ordre-debut-et-fin-limitation/form-ordre-debut-et-fin-limitation.component';
import { FormCourbeComptageReferenceComponent } from './form-courbe-comptage-reference/form-courbe-comptage-reference.component';
import { FormEneEniFichierComponent } from './form-ene-eni/form-ene-eni-fichier/form-ene-eni-fichier.component';
import { FormEneEniFormComponent } from './form-ene-eni/form-ene-eni-form/form-ene-eni-form.component';
import { FormEneEniComponent } from './form-ene-eni/form-ene-eni.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {FormAjoutTarifUnitaireComponent} from "./form-ajout-tarif-unitaire/form-ajout-tarif-unitaire.component";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MicroComponentsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    PipesModule,
    MatRadioModule,
    MatStepperModule,
    MatDatepickerModule,
    MatAutocompleteModule,
  ],
  declarations: [
    FormSitesProductionRechercheComponent,
    FormOrdreDebutLimitationComponent,
    FormOrdreFinLimitationComponent,
    FormOrdreFinLimitationFichierComponent,
    FormOrdreFinLimitationSaisieManuelleComponent,
    FormOrdreDebutEtFinLimitationComponent,
    FormLimitationsRechercheComponent,
    FormCourbeComptageReferenceComponent,
    FormEneEniFichierComponent,
    FormEneEniFormComponent,
    FormEneEniComponent,
    FormAjoutTarifUnitaireComponent,
  ],
  exports: [
    FormSitesProductionRechercheComponent,
    FormOrdreDebutLimitationComponent,
    FormOrdreFinLimitationComponent,
    FormOrdreDebutEtFinLimitationComponent,
    FormLimitationsRechercheComponent,
    FormCourbeComptageReferenceComponent,
    FormEneEniComponent,
    FormAjoutTarifUnitaireComponent,
  ],
})
export class FormulairesModule {}
