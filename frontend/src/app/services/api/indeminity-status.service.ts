import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {
  FormulaireRechercheHistoriqueLimitation,
  RechercheHistoriqueLimitationEntite
} from "../../models/RechercheHistoriqueLimitation";
import {Observable, of} from "rxjs";
import {IndeminityStatus} from "../../models/enum/IndeminityStatus.enum";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class IndeminityStatusService {
  constructor(private httpClient: HttpClient) {
  }

  public updateIndeminisationStatus(activationDocumentMrid: string): Observable<IndeminityStatus> {
    const formData = {
      activationDocumentMrid: activationDocumentMrid,
    };
    return this.httpClient.post<IndeminityStatus>(`${environment.serverUrl}/indemnityStatusUpdate`, formData);
  }

}
