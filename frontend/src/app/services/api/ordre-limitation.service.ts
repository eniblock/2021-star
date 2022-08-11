import {environment} from 'src/environments/environment';
import {
  FormulaireOrdreDebutEtFinLimitationFichier,
  FormulaireOrdreDebutLimitationFichier,
  FormulaireOrdreFinLimitation,
  FormulaireOrdreFinLimitationFichier,
  OrdreLimitation,
} from 'src/app/models/OrdreLimitation';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {FormDataHelper} from "./helpers/formData-helper";
import {EligibilityStatus} from "../../models/enum/EligibilityStatus.enum";

@Injectable({
  providedIn: 'root',
})
export class OrdreLimitationService {
  constructor(private httpClient: HttpClient) {
  }

  creerOrdreDebutAvecFichiers(
    formulaireOrdreDebutLimitationFichier: FormulaireOrdreDebutLimitationFichier
  ): Observable<void> {
    let formData = new FormData();
    FormDataHelper.appendFiles(formData, formulaireOrdreDebutLimitationFichier.files);

    return this.httpClient.post<void>(
      `${environment.serverUrl}/ordreLimitations/debut`,
      formData
    );
  }

  creerOrdreFinAvecFichiers(
    formulaireOrdreFinLimitationFichier: FormulaireOrdreFinLimitationFichier
  ): Observable<void> {
    let formData = new FormData();
    FormDataHelper.appendFiles(formData, formulaireOrdreFinLimitationFichier.files);

    return this.httpClient.post<void>(
      `${environment.serverUrl}/ordreLimitations/fin`,
      formData
    );
  }

  creerOrdreDebutFinAvecFichiers(
    formulaireOrdreDebutEtFinLimitationFichier: FormulaireOrdreDebutEtFinLimitationFichier
  ): Observable<void> {
    let formData = new FormData();
    FormDataHelper.appendFiles(
      formData,
      formulaireOrdreDebutEtFinLimitationFichier.files
    );

    return this.httpClient.post<void>(
      `${environment.serverUrl}/ordreLimitations/couple`,
      formData
    );
  }

  creerOrdreFin(form: FormulaireOrdreFinLimitation): Observable<void> {
    return this.httpClient.post<void>(
      `${environment.serverUrl}/ordreLimitations/fin`,
      form
    );
  }

  updateEligibilityStatus(activationDocumentMrid: string, eligibilityStatus: EligibilityStatus): Observable<OrdreLimitation> {
    const body = {activationDocumentMrid: activationDocumentMrid, eligibilityStatus: eligibilityStatus};
    return this.httpClient.post<OrdreLimitation>(
      `${environment.serverUrl}/ordreLimitations/eligibilityStatus`,
      body
    );
  }

}
