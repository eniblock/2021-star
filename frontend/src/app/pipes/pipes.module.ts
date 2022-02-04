import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdreRechercheReseauPipe } from './OrdreRechercheReseau.pipe';
import { TechnologyTypePipe } from './TechnologyType.pipe';
import { TypeDeRechercheSimplePipe } from './TypeDeRechercheSimple.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    OrdreRechercheReseauPipe,
    TechnologyTypePipe,
    TypeDeRechercheSimplePipe,
  ],
  exports: [
    OrdreRechercheReseauPipe,
    TechnologyTypePipe,
    TypeDeRechercheSimplePipe,
  ],
})
export class PipesModule {}
