import { OrdreRechercheReseau } from 'src/app/models/enum/OrdreRechercheReseau.enum';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'OrdreRechercheReseau',
})
export class OrdreRechercheReseauPipe implements PipeTransform {
  transform(value?: OrdreRechercheReseau | OrdreRechercheReseau[]): any {
    if (value == undefined) {
      return '';
    }
    if (value instanceof Array) {
      return value.map((t) => this.toString(t)).join(', ');
    }
    return this.toString(value);
  }

  toString(value: OrdreRechercheReseau): string {
    switch (value) {
      case OrdreRechercheReseau.producerMarketParticipantName:
        return 'Nom du producteur';
      case OrdreRechercheReseau.technologyType:
        return 'Filière';
    }
    return 'OrdreRechercheReseau inconnu';
  }
}
