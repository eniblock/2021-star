import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {environment} from 'src/environments/environment';
import {FormulaireReserveBid, ReserveBid} from "../../models/ReserveBid";
import {HttpClient} from "@angular/common/http";
import {FormDataHelper} from "./helpers/formData-helper";
import {KeycloakService} from "../common/keycloak.service";
import {ReserveBidStatus} from "../../models/enum/ReserveBidStatus.enum";

const MOCK = false;

@Injectable({
  providedIn: 'root',
})
export class ReserveBidService {

  constructor(
    private httpClient: HttpClient,
    private keycloakService: KeycloakService,
  ) {
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
      callResult = this.httpClient.get<ReserveBid[] | null>(`${environment.serverUrl}/reserveBid/${meteringPointMrid}`);
    }
    return callResult;
  }

  getFileName(fileId: string): string {
    return fileId.substring(fileId.indexOf('_') + 1, fileId.length);
  }

  getFileUrl(fileId: string): string {
    return `${environment.serverUrl}/reserveBid/file?fileId=${fileId}`;
  }

  download(fileUrl: string, fileName: string) {
    this.keycloakService.getToken(true)
      .subscribe(token => {
        let headers = new Headers();
        headers.append('Authorization', 'bearer ' + token);
        fetch(fileUrl, {headers})
          .then(response => response.blob())
          .then(blobby => {
            let objectUrl = window.URL.createObjectURL(blobby);
            const anchor = document.createElement('a');
            anchor.href = objectUrl;
            anchor.download = fileName;
            anchor.click();
            URL.revokeObjectURL(objectUrl);
          });
      });
  }

  modifyStatus(newStatus: ReserveBidStatus, reserveBidMRID: string): Observable<void> {
    return this.httpClient.put<void>(`${environment.serverUrl}/reserveBid/${reserveBidMRID}/${newStatus}`, null);
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
        validityPeriodEndDateTime: "",
        businessType: "string",
        quantityMeasureUnitName: "MWh",
        priceMeasureUnitName: "€/MWh",
        currencyUnitName: "€",
        flowDirection: "string",
        energyPriceAmount: 12,
        attachments: [],
        reserveBidStatus: ReserveBidStatus.VALIDATED
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
        validityPeriodStartDateTime: "2021-09-11T05:22:00Z",
        validityPeriodEndDateTime: "",
        businessType: "string",
        quantityMeasureUnitName: "MWh",
        priceMeasureUnitName: "€/MWh",
        currencyUnitName: "€",
        flowDirection: "string",
        energyPriceAmount: 23,
        attachments: [
          "fichier1.pdf",
          "fichier2.pdf",
        ],
        reserveBidStatus: ReserveBidStatus.NEW
      }
    ]
  )
};

