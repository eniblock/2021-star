import { environment } from 'src/environments/environment';
import { FormulaireOrdreDebutLimitation } from 'src/app/models/OrdreLimitation';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrdreLimitationService {
  constructor(private httpClient: HttpClient) {}

  creerOrdreDebut(
    formulaireOrdreDebutLimitation: FormulaireOrdreDebutLimitation
  ): Observable<void> {
    let formData = new FormData();
    formData.append('fichier', formulaireOrdreDebutLimitation.fichier);

    return this.httpClient.post<void>(
      `${environment.serverUrl}/ordreLimitations/debut`,
      formData
    );
  }
}
