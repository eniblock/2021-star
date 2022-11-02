import {Pipe, PipeTransform} from '@angular/core';
import {ReserveBidStatus} from "../models/enum/ReserveBidStatus.enum";

@Pipe({
  name: 'ReserveBidStatus',
})
export class ReserveBidStatusPipe implements PipeTransform {
  transform(value?: ReserveBidStatus | ReserveBidStatus[]): any {
    if (value == undefined) {
      return '';
    }
    if (value instanceof Array) {
      return value.map((t) => this.toString(t)).join(', ');
    }
    return this.toString(value);
  }

  toString(value: ReserveBidStatus): string {
    switch (value) {
      case ReserveBidStatus.NEW:
        return 'Nouveau';
      case ReserveBidStatus.VALIDATED:
        return 'Validé';
      case ReserveBidStatus.REFUSED:
        return 'Refusé';
    }
    return 'ReserveBidStatus inconnu';
  }
}
