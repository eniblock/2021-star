import { Pipe, PipeTransform } from '@angular/core';
import { ChampDeRechercheReseauSimple } from '../models/enum/ChampDeRechercheReseauSimple.enum';

@Pipe({
  name: 'TechnologyType',
})
export class ChampDeRechercheReseauSimplePipe implements PipeTransform {
  transform(
    value: ChampDeRechercheReseauSimple | ChampDeRechercheReseauSimple[],
    args?: any
  ): any {
    if (value instanceof Array) {
      return value.map((t) => this.toString(t)).join(', ');
    }
    return this.toString(value);
  }

  toString(value: ChampDeRechercheReseauSimple): string {
    switch (value) {
      case ChampDeRechercheReseauSimple.producerMarketParticipantName:
        return 'Nom de producteur';
      case ChampDeRechercheReseauSimple.siteName:
        return 'Nom du site';
      case ChampDeRechercheReseauSimple.substationName:
        return 'Nom du poste source';
    }
    return 'ChampDeRechercheReseauSimple inconnu';
  }
}
