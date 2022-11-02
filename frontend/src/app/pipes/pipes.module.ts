import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrdreRechercheSitesProductionPipe} from './OrdreRechercheSitesProduction.pipe';
import {TechnologyTypePipe} from './TechnologyType.pipe';
import {TypeDeRechercheSimplePipe} from './TypeDeRechercheSimple.pipe';
import {LimitationTableFieldPipe} from './LimitationTableField.pipe';
import {ReserveBidStatusPipe} from "./ReserveBidStatus.pipe";

@NgModule({
  imports: [CommonModule],
  declarations: [
    OrdreRechercheSitesProductionPipe,
    TechnologyTypePipe,
    TypeDeRechercheSimplePipe,
    LimitationTableFieldPipe,
    ReserveBidStatusPipe,
  ],
  exports: [
    OrdreRechercheSitesProductionPipe,
    TechnologyTypePipe,
    TypeDeRechercheSimplePipe,
    LimitationTableFieldPipe,
    ReserveBidStatusPipe,
  ],
})
export class PipesModule {
}
