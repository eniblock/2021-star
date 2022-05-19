import {UrlService} from './../common/url.service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {FormulaireEnergyAmount, FormulaireEnergyAmountFile} from "../../models/EnergyAmount";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {FormDataHelper} from "./helpers/formData-helper";

@Injectable({
  providedIn: 'root',
})
export class EnergyAmountService {

  constructor(private httpClient: HttpClient, private urlService: UrlService) {
  }

  createWithFile(form: FormulaireEnergyAmountFile): Observable<void> {
    let formData = new FormData();
    FormDataHelper.appendFiles(formData, form.files);
    return this.httpClient.post<void>(
      `${environment.serverUrl}/energyAmounts`,
      formData
    );
  }

  createWithForm(form: FormulaireEnergyAmount): Observable<void> {
    let formData = new FormData();
    FormDataHelper.appendObject(formData, 'energyAmount', form);
    return this.httpClient.post<void>(`${environment.serverUrl}/energyAmounts`, formData);
  }

};
