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
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {
  SitesProductionResultatFileLinkComponent
} from './sites-production-resultats/sites-production-resultat-file-link/sites-production-resultat-file-link.component';

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
    MatDatepickerModule,
    MatTableModule,
    MatTooltipModule,
  ],
  declarations: [
    SitesProductionComponent,
    SitesProductionResultatComponent,
    SitesProductionResultatFileLinkComponent,
  ],
})
export class SitesProductionModule {
}
