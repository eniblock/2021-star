import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdreRechercheSitesProductionPipe } from './OrdreRechercheSitesProduction.pipe';
import { TechnologyTypePipe } from './TechnologyType.pipe';
import { TypeDeRechercheSimplePipe } from './TypeDeRechercheSimple.pipe';
import { ActivationTableFieldPipe } from './ActivationTableField.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    OrdreRechercheSitesProductionPipe,
    TechnologyTypePipe,
    TypeDeRechercheSimplePipe,
    ActivationTableFieldPipe,
  ],
  exports: [
    OrdreRechercheSitesProductionPipe,
    TechnologyTypePipe,
    TypeDeRechercheSimplePipe,
    ActivationTableFieldPipe,
  ],
})
export class PipesModule {}
