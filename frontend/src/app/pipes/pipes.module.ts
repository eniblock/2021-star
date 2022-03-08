import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdreRechercheReseauPipe } from './OrdreRechercheReseau.pipe';
import { TechnologyTypePipe } from './TechnologyType.pipe';
import { TypeDeRechercheSimplePipe } from './TypeDeRechercheSimple.pipe';
import { ActivationTableFieldPipe } from './ActivationTableField.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    OrdreRechercheReseauPipe,
    TechnologyTypePipe,
    TypeDeRechercheSimplePipe,
    ActivationTableFieldPipe,
  ],
  exports: [
    OrdreRechercheReseauPipe,
    TechnologyTypePipe,
    TypeDeRechercheSimplePipe,
    ActivationTableFieldPipe,
  ],
})
export class PipesModule {}
