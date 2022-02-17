import { NativeDateAdapter } from '@angular/material/core';
import { DateHelper } from 'src/app/helpers/date.helper';

/**
 * Affichage et manipulation des dates par les datepickers
 */
export class CustomDateAdapter extends NativeDateAdapter {
  parse(value: string): Date | null {
    if (value == null || value == '') {
      return null;
    }
    return DateHelper.stringToDate(value);
  }

  createDate(year: number, month: number, date: number): Date {
    return DateHelper.makeDate(date, month, year);
  }

  getFirstDayOfWeek(): number {
    return 1; // Lundi est le premier
  }
}
