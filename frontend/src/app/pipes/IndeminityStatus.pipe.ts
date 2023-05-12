import {Pipe, PipeTransform} from '@angular/core';
import {IndeminityStatus} from "../models/enum/IndeminityStatus.enum";

@Pipe({
  name: 'IndeminityStatus',
})
export class IndeminityStatusPipe implements PipeTransform {
  transform(value?: IndeminityStatus | IndeminityStatus[]): any {
    if (value == undefined) {
      return '';
    }
    if (value instanceof Array) {
      return value.map((t) => this.toString(t)).join(', ');
    }
    return this.toString(value);
  }

  toString(value: IndeminityStatus): string {
    switch (value) {
      case IndeminityStatus.InProgress:
        return 'En cours';
      case IndeminityStatus.Agreement:
        return 'Accord pour\nindemnisation';
      case IndeminityStatus.Processed:
        return 'Traité';
      case IndeminityStatus.WaitingInvoice:
        return 'Commande émise';
      case IndeminityStatus.InvoiceSent:
        return 'Facture envoyée';
      case IndeminityStatus.Abandoned:
        return 'Abandonné';
      case IndeminityStatus.Unvalid:
        return '###';
      }
    return 'OrdreRechercheSitesProduction inconnu';
  }
}
