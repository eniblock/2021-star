import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReseauComponent } from './reseau.component';
import { ReseauRoutes } from './reseau.routing';
import { ReseauResultatComponent } from './reseau-resultats/reseau-resultat.component';
import { FormulairesModule } from 'src/app/components/formulaires/formulaires.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MicroComponentsModule } from 'src/app/components/micro-components/micro-components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    ReseauRoutes,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    FormulairesModule,
    MatButtonModule,
    MicroComponentsModule,
    PipesModule,
  ],
  declarations: [
    ReseauComponent,
    ReseauResultatComponent,
  ],
})
export class ReseauModule {}
