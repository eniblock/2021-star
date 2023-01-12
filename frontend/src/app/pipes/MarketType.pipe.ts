import {Pipe, PipeTransform} from '@angular/core';
import {MarketType} from "../models/enum/MarketTypePipe.enum";

@Pipe({
  name: 'MarketType',
})
export class MarketTypePipe implements PipeTransform {
  transform(value?: MarketType | MarketType[]): any {
    if (value == undefined) {
      return '';
    }
    if (value instanceof Array) {
      return value.map((t) => this.toString(t)).join(', ');
    }
    return this.toString(value);
  }

  toString(value: MarketType): string {
    switch (value) {
      case MarketType.OA:
        return 'Obligation d’achat (OA)';
      case MarketType.CR:
        return 'Complément de rémunération (CR)';
      case MarketType.DAILY_MARKET:
        return 'Valorisation sur le marché';
    }
    return 'MarketType inconnu';
  }
}
