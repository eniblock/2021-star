import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';
import {FormulaireReserveBid} from "../../models/ReserveBid";
import {HttpClient} from "@angular/common/http";
import {FormDataHelper} from "./helpers/formData-helper";

@Injectable({
  providedIn: 'root',
})
export class ReserveBidService {

  constructor(private httpClient: HttpClient) {
  }

  createReserveBid(form: FormulaireReserveBid, files: File[] | null): Observable<void> {
    form = {
      ...form,
      energyPriceAmount: +form.energyPriceAmount, // string to number
    };
    let formData = new FormData()
    if (files != null && files.length > 0) {
      FormDataHelper.appendFiles(formData, files);
    }
    FormDataHelper.appendObject(formData, 'reserveBid', form);
    return this.httpClient.post<void>(`${environment.serverUrl}/reserveBid`, formData);
  }

}
