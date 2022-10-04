import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {environment} from 'src/environments/environment';
import {FormulaireReserveBid, ReserveBid} from "../../models/ReserveBid";
import {HttpClient} from "@angular/common/http";
import {FormDataHelper} from "./helpers/formData-helper";
import {
  FormulaireRechercheHistoriqueLimitation,
  RechercheHistoriqueLimitationEntite
} from "../../models/RechercheHistoriqueLimitation";

const MOCK = false;

@Injectable({
  providedIn: 'root',
})
export class ReserveBidService {

  constructor(private httpClient: HttpClient) {
  }

  createReserveBid(form: FormulaireReserveBid, files: File[] | null): Observable<void> {
    let formData = new FormData()
    if (files != null && files.length > 0) {
      FormDataHelper.appendFiles(formData, files);
    }
    FormDataHelper.appendObject(formData, 'reserveBid', form);
    return this.httpClient.post<void>(`${environment.serverUrl}/reserveBid`, formData);
  }

  getReserveBidBySite(meteringPointMrid: string): Observable<ReserveBid[] | null> {
    let callResult: Observable<ReserveBid[] | null>;
    if (MOCK) {
      console.log(meteringPointMrid);
      callResult = getMocks(meteringPointMrid);
    } else {
      callResult = this.httpClient.get<ReserveBid[] | null>(`${environment.serverUrl}/reserveBid?meteringPointMrid=` + meteringPointMrid);
    }
    return callResult;
  }

}


/* *********************************************************
                               MOCKS
   ********************************************************* */
const getMocks = (meteringPointMrid: string): Observable<ReserveBid[] | null> => {
  //return of (null);
  return of([
      {
        reserveBidMrid: "reserveBidMrid1",
        meteringPointMrid: meteringPointMrid,
        revisionNumber: "1",
        messageType: "string",
        processType: "string",
        senderMarketParticipantMrid: "string",
        receiverMarketParticipantMrid: "string",
        createdDateTime: "2019-09-11T05:22:00Z",
        validityPeriodStartDateTime: "2020-09-11T05:22:00Z",
        validityPeriodEndDateTime: "2024-09-11T05:22:00Z",
        businessType: "string",
        quantityMeasureUnitName: "MWh",
        priceMeasureUnitName: "€/MWh",
        currencyUnitName: "€",
        flowDirection: "string",
        energyPriceAmount: 12,
      },
      {
        reserveBidMrid: "reserveBidMrid2",
        meteringPointMrid: meteringPointMrid,
        revisionNumber: "1",
        messageType: "string",
        processType: "string",
        senderMarketParticipantMrid: "string",
        receiverMarketParticipantMrid: "string",
        createdDateTime: "2019-09-11T05:22:00Z",
        validityPeriodStartDateTime: "2020-09-11T05:22:00Z",
        validityPeriodEndDateTime: "2023-09-11T05:22:00Z",
        businessType: "string",
        quantityMeasureUnitName: "MWh",
        priceMeasureUnitName: "€/MWh",
        currencyUnitName: "€",
        flowDirection: "string",
        energyPriceAmount: 23,
      }
    ]
  )
};

