import { Pipe, PipeTransform } from '@angular/core';
import { TechnologyType } from '../models/enum/TechnologyType.enum';

@Pipe({
  name: 'TechnologyType',
})
export class TechnologyTypePipe implements PipeTransform {
  transform(value: TechnologyType | TechnologyType[], args?: any): any {
    if (value instanceof Array) {
      return value.map((t) => this.toString(t)).join(', ');
    }
    return this.toString(value);
  }

  toString(value: TechnologyType): string {
    switch (value) {
      case TechnologyType.EOLIEN:
        return 'Eolien';
      case TechnologyType.PHOTOVOLTAIQUE:
        return 'Photovoltaïque';
    }
    return 'TechnologyType inconnu';
  }
}
