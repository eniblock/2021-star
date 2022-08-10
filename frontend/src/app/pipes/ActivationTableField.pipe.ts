import { Pipe, PipeTransform } from '@angular/core';

export const ACTIVATIONS_TABLE_COLUMNS_DEF = [
  { id: 'technologyType', champ: 'Filière' },
  { id: 'originAutomationRegisteredResourceMrid', champ: 'Poste Source' },
  { id: 'producerMarketParticipantName', champ: 'Nom Producteur' },
  { id: 'siteName', champ: 'Nom Site' },
  { id: 'producerMarketParticipantMrid', champ: 'Code Producteur' },
  { id: 'debutLimitation', champ: 'Début limitation' },
  { id: 'finLimitation', champ: 'Fin limitation' },
  { id: 'typeLimitation', champ: 'Type de limitation' },
  { id: 'quantity', champ: 'ENE/I (MWh)' },
  { id: 'motif', champ: 'Motif' },
  { id: 'indemnisation', champ: 'Eligible indemnisation' },
];

@Pipe({
  name: 'ActivationTableField',
})
export class ActivationTableFieldPipe implements PipeTransform {
  transform(value?: string): any {
    if (value == undefined) {
      return '';
    }
    const r = ACTIVATIONS_TABLE_COLUMNS_DEF.find(
      (def) => def.id == value
    )?.champ;
    return r == null ? '' : r;
  }
}
