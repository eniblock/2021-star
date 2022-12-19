import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class ReconciliationService {
  constructor(
    private httpClient: HttpClient,
  ) {
  }

  reconciliate(): Observable<void> {
    return this.httpClient.post<void>(`${environment.serverUrl}/reconciliation`, null);
  }
}
