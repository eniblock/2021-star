import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LimitationsComponent} from './limitations.component';
import {FormulairesModule} from 'src/app/components/formulaires/formulaires.module';
import {ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {PipesModule} from 'src/app/pipes/pipes.module';
import {MatButtonModule} from '@angular/material/button';
import {ActivationsResultatsComponent} from './activations-resultats/activations-resultats.component';
import {MatTableModule} from '@angular/material/table';
import {ActivationsColumnSelectorComponent} from './activations-column-selector/activations-column-selector.component';
import {MatSortModule} from '@angular/material/sort';
import {MicroComponentsModule} from 'src/app/components/micro-components/micro-components.module';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {GraphModule} from 'src/app/components/graph/graph.module';
import {ActivationGraphComponent} from './activation-graph/activation-graph.component';
import {ActivationHorodatesComponent} from './activation-horodates/activation-horodates.component';
import {ActivationIndemnisationComponent} from './activation-indemnisation/activation-indemnisation.component';
import {
  ActivationIndemnisationChooseYesNoComponent
} from './activation-indemnisation/activation-indemnisation-choose-yes-no/activation-indemnisation-choose-yes-no.component';
import {MatDialogModule} from '@angular/material/dialog';
import {LimitationsRoutes} from "./limitations.routing";

@NgModule({
  imports: [
    CommonModule,
    LimitationsRoutes,
    ReactiveFormsModule,
    MicroComponentsModule,
    MatFormFieldModule,
    MatSelectModule,
    FormulairesModule,
    PipesModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatBottomSheetModule,
    GraphModule,
    MatDialogModule,
  ],
  declarations: [
    LimitationsComponent,
    ActivationsResultatsComponent,
    ActivationsColumnSelectorComponent,
    ActivationGraphComponent,
    ActivationHorodatesComponent,
    ActivationIndemnisationComponent,
    ActivationIndemnisationChooseYesNoComponent,
  ],
})
export class LimitationsModule {
}
