import { Pipe, PipeTransform } from '@angular/core';
import { TypeDeRechercheSimple } from '../models/enum/TypeDeRechercheSimple.enum';

@Pipe({
  name: 'TypeDeRechercheSimple',
})
export class TypeDeRechercheSimplePipe implements PipeTransform {
  transform(value?: TypeDeRechercheSimple | TypeDeRechercheSimple[]): any {
    if (value == undefined) {
      return '';
    }
    if (value instanceof Array) {
      return value.map((t) => this.toString(t)).join(', ');
    }
    return this.toString(value);
  }

  toString(value: TypeDeRechercheSimple): string {
    switch (value) {
      case TypeDeRechercheSimple.producerMarketParticipantName:
        return 'Nom de producteur';
      case TypeDeRechercheSimple.siteName:
        return 'Nom du site';
      case TypeDeRechercheSimple.substationName:
        return 'Nom du poste source';
      case undefined:
        return 'Producteur, site, poste source...';
    }
    return 'TypeDeRechercheSimple inconnu';
  }
}
