import {UrlService} from './../common/url.service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {FormulaireEnergyAmount, FormulaireEnergyAmountFile} from "../../models/EnergyAmount";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {FileHelper} from "./helpers/file-helper";

@Injectable({
  providedIn: 'root',
})
export class EnergyAmountService {

  constructor(private httpClient: HttpClient, private urlService: UrlService) {
  }

  createWithFile(form: FormulaireEnergyAmountFile): Observable<void> {
    let formData = new FormData();
    FileHelper.appendFiles(formData, form.files);
    return this.httpClient.post<void>(
      `${environment.serverUrl}/energyAmounts`,
      formData
    );
  }

  createWithForm(form: FormulaireEnergyAmount): Observable<void> {
    return this.httpClient.post<void>(
      `${environment.serverUrl}/energyAmounts`,
      form
    );
  }

};
