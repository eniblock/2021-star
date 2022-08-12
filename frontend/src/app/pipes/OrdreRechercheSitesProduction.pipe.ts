import { OrdreRechercheSitesProduction } from 'src/app/models/enum/OrdreRechercheSitesProduction.enum';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'OrdreRechercheSitesProduction',
})
export class OrdreRechercheSitesProductionPipe implements PipeTransform {
  transform(value?: OrdreRechercheSitesProduction | OrdreRechercheSitesProduction[]): any {
    if (value == undefined) {
      return '';
    }
    if (value instanceof Array) {
      return value.map((t) => this.toString(t)).join(', ');
    }
    return this.toString(value);
  }

  toString(value: OrdreRechercheSitesProduction): string {
    switch (value) {
      case OrdreRechercheSitesProduction.producerMarketParticipantName:
        return 'Nom du producteur';
      case OrdreRechercheSitesProduction.technologyType:
        return 'Filière';
    }
    return 'OrdreRechercheSitesProduction inconnu';
  }
}
