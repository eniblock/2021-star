import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivationsComponent } from './activations.component';
import { ActivationsRoutes } from './activations.routing';
import { FormulairesModule } from 'src/app/components/formulaires/formulaires.module';
import { ActivationsPaginationComponent } from './activations-pagination/activations-pagination.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { MatButtonModule } from '@angular/material/button';
import { ActivationsResultatsComponent } from './activations-resultats/activations-resultats.component';
import { MatTableModule } from '@angular/material/table';
import { ActivationsColumnSelectorComponent } from './activations-column-selector/activations-column-selector.component';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
  imports: [
    CommonModule,
    ActivationsRoutes,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    FormulairesModule,
    PipesModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
  ],
  declarations: [
    ActivationsComponent,
    ActivationsPaginationComponent,
    ActivationsResultatsComponent,
    ActivationsColumnSelectorComponent,
  ],
})
export class ActivationsModule {}
