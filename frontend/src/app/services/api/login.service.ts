import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';
import {Site} from "../../models/Site";
import {FormulaireEnergyAmountFile} from "../../models/EnergyAmount";
import {FormDataHelper} from "./helpers/formData-helper";

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  constructor(
    private httpClient: HttpClient,
  ) {
  }

  countConnections(): Observable<void> {
    return this.httpClient.post<void>(
      `${environment.serverUrl}/login/countConnections`,
      null
    );
  }

}
