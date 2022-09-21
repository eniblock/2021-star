import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SitesProductionComponent} from './sites-production.component';
import {SitesProductionRoutes} from './sites-production.routing';
import {SitesProductionResultatComponent} from './sites-production-resultats/sites-production-resultat.component';
import {FormulairesModule} from 'src/app/components/formulaires/formulaires.module';
import {ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MicroComponentsModule} from 'src/app/components/micro-components/micro-components.module';
import {PipesModule} from 'src/app/pipes/pipes.module';
import {
  SitesProductionAjoutTarifUnitaireComponent
} from './sites-production-ajout-tarif-unitaire/sites-production-ajout-tarif-unitaire.component';
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";

@NgModule({
  imports: [
    CommonModule,
    SitesProductionRoutes,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    FormulairesModule,
    MatButtonModule,
    MicroComponentsModule,
    PipesModule,
    MatBottomSheetModule,
  ],
  declarations: [
    SitesProductionComponent,
    SitesProductionResultatComponent,
    SitesProductionAjoutTarifUnitaireComponent,
  ],
})
export class SitesProductionModule {
}
