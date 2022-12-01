import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LimitationsComponent} from './limitations.component';
import {FormulairesModule} from 'src/app/components/formulaires/formulaires.module';
import {ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {PipesModule} from 'src/app/pipes/pipes.module';
import {MatButtonModule} from '@angular/material/button';
import {LimitationsResultatsComponent} from './limitations-resultats/limitations-resultats.component';
import {MatTableModule} from '@angular/material/table';
import {LimitationsColumnSelectorComponent} from './limitations-column-selector/limitations-column-selector.component';
import {MatSortModule} from '@angular/material/sort';
import {MicroComponentsModule} from 'src/app/components/micro-components/micro-components.module';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {GraphModule} from 'src/app/components/graph/graph.module';
import {LimitationsGraphComponent} from './limitations-graph/limitations-graph.component';
import {LimitationsHorodatesComponent} from './limitations-horodates/limitations-horodates.component';
import {LimitationsIndemnisationComponent} from './limitations-indemnisation/limitations-indemnisation.component';
import {
  LimitationsIndemnisationChooseYesNoComponent
} from './limitations-indemnisation/limitations-indemnisation-choose-yes-no/limitations-indemnisation-choose-yes-no.component';
import {MatDialogModule} from '@angular/material/dialog';
import {LimitationsRoutes} from './limitations.routing';
import {
  LimitationsFilterOnResultsComponent
} from './limitations-filter-on-results/limitations-filter-on-results.component';
import { LimitationsFeedbackProducerComponent } from './limitations-feedback-producer/limitations-feedback-producer.component';
import { LimitationIndeminityStatusComponent } from './limitation-indeminity-status/limitation-indeminity-status.component';
import { LimitationIndeminityStatusChangeComponent } from './limitation-indeminity-status/limitation-indeminity-status-change/limitation-indeminity-status-change.component';

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
    LimitationsResultatsComponent,
    LimitationsColumnSelectorComponent,
    LimitationsGraphComponent,
    LimitationsHorodatesComponent,
    LimitationsIndemnisationComponent,
    LimitationsIndemnisationChooseYesNoComponent,
    LimitationsFilterOnResultsComponent,
    LimitationsFeedbackProducerComponent,
    LimitationIndeminityStatusComponent,
    LimitationIndeminityStatusChangeComponent,
  ],
})
export class LimitationsModule {
}
