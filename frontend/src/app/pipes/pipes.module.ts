import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdreRechercheSitesProductionPipe } from './OrdreRechercheSitesProduction.pipe';
import { TechnologyTypePipe } from './TechnologyType.pipe';
import { TypeDeRechercheSimplePipe } from './TypeDeRechercheSimple.pipe';
import { LimitationTableFieldPipe } from './LimitationTableField.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    OrdreRechercheSitesProductionPipe,
    TechnologyTypePipe,
    TypeDeRechercheSimplePipe,
    LimitationTableFieldPipe,
  ],
  exports: [
    OrdreRechercheSitesProductionPipe,
    TechnologyTypePipe,
    TypeDeRechercheSimplePipe,
    LimitationTableFieldPipe,
  ],
})
export class PipesModule {}
