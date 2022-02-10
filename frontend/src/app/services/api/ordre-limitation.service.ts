import { environment } from 'src/environments/environment';
import {
  FormulaireOrdreDebutLimitationFichier,
  FormulaireOrdreFinLimitation,
  FormulaireOrdreFinLimitationFichier,
} from 'src/app/models/OrdreLimitation';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrdreLimitationService {
  constructor(private httpClient: HttpClient) {}

  creerOrdreDebutAvecFichier(
    formulaireOrdreDebutLimitationFichier: FormulaireOrdreDebutLimitationFichier
  ): Observable<void> {
    let formData = new FormData();
    formData.append('fichier', formulaireOrdreDebutLimitationFichier.fichier);

    return this.httpClient.post<void>(
      `${environment.serverUrl}/ordreLimitations/debut/fichier`,
      formData
    );
  }

  creerOrdreFinAvecFichier(
    formulaireOrdreFinLimitationFichier: FormulaireOrdreFinLimitationFichier
  ): Observable<void> {
    let formData = new FormData();
    formData.append('fichier', formulaireOrdreFinLimitationFichier.fichier);

    return this.httpClient.post<void>(
      `${environment.serverUrl}/ordreLimitations/fin/fichier`,
      formData
    );
  }

  creerOrdreFin(form: FormulaireOrdreFinLimitation): Observable<void> {
    return this.httpClient.post<void>(
      `${environment.serverUrl}/ordreLimitations/fin/`,
      form
    );
  }
}
