import { Injectable } from '@angular/core';
import { RechercheReseauForm } from 'src/app/models/RechercheReseau';

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  constructor() {}

  toUrlParams(form: Object): string {
    return Object.entries(form)
      .map(([key, value]) => {
        if (value != undefined && value != null && value != '') {
          if (Array.isArray(value)) {
            // Si l'urlParam est un tableau [val1,val2,...] => on retourne key=val1&key=val2&...
            return value
              .map((elem) => key + '=' + this.encodeParamValue(elem))
              .join('&');
          }
          // Si l'urlParam n'est pas un tableau et est définie => on retourne key=value
          return key + '=' + this.encodeParamValue(value);
        } else {
          // Si l'urlParam n'est pas définie => on ne retourne rien
          return null;
        }
      })
      .filter((elem) => elem != null) // On filtre les urlParams null
      .join('&'); // On met un '&' entre chaque urlParams
  }

  private encodeParamValue(paramValue: string): string {
    return encodeURIComponent(paramValue);
  }
}
