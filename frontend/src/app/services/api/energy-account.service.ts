import {UrlService} from './../common/url.service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {EnergyAccount, FormulaireEnergyAccount} from 'src/app/models/EnergyAccount';
import {MeasurementUnitName} from 'src/app/models/enum/MeasurementUnitName.enum';
import {ProcessType} from 'src/app/models/enum/ProcessType.enum';
import {environment} from 'src/environments/environment';
import {FormDataHelper} from "./helpers/formData-helper";

const MOCK = false;

@Injectable({
  providedIn: 'root',
})
export class EnergyAccountService {
  constructor(private httpClient: HttpClient, private urlService: UrlService) {
  }

  find(
    meteringPointMrid: string,
    startCreatedDateTime: string,
    endCreatedDateTime: string
  ): Observable<EnergyAccount[]> {
    if (MOCK) {
      return getMocks();
    }

    const data = {
      meteringPointMrid: meteringPointMrid,
      startCreatedDateTime: startCreatedDateTime,
      endCreatedDateTime: endCreatedDateTime,
    };
    let urlParams = this.urlService.toUrlParams(data);
    return this.httpClient.get<EnergyAccount[]>(
      `${environment.serverUrl}/energyAccounts?${urlParams}`
    );
  }

  creer(
    formulaireEnergyAccount: FormulaireEnergyAccount
  ): Observable<void> {
    let formData = new FormData();
    FormDataHelper.appendFiles(formData, formulaireEnergyAccount.files);
    return this.httpClient.post<void>(
      `${environment.serverUrl}/energyAccounts`,
      formData
    );
  }

}

/* *********************************************************
                               MOCKS
   ********************************************************* */
const getEmptyMock = (): Observable<EnergyAccount[]> => {
  return of([]);
}

const getMocks = (): Observable<EnergyAccount[]> => {
  return of([
    {
      processType: ProcessType.A05,
      timeInterval: '2019-09-08T00:00:00Z/2019-09-08T23:59:59Z',
      resolution: 'PT10M',
      measurementUnitName: MeasurementUnitName.MW,
      timeSeries: [
        {position: 1, inQuantity: 2},
        {position: 2, inQuantity: 5},
        {position: 3, inQuantity: 5}, // unused point (same inQuantity)
        {position: 20, inQuantity: 7},
        {position: 25, inQuantity: 8},
      ],
    },
    {
      processType: 'unkhown' as any, // an unkonwn processType
      timeInterval: '2019-09-09T00:00:00Z/2019-09-09T23:59:59Z',
      resolution: 'PT10M',
      measurementUnitName: MeasurementUnitName.MW,
      timeSeries: [
        {position: 1, inQuantity: 3},
        {position: 32, inQuantity: 0},
      ],
    },
    {
      processType: ProcessType.A05,
      timeInterval: '2019-09-09T00:00:00Z/2019-09-09T23:59:59Z',
      resolution: 'PT5M',
      measurementUnitName: MeasurementUnitName.MW,
      timeSeries: [
        {position: 1, inQuantity: 2},
        {position: 4, inQuantity: 5},
        {position: 30, inQuantity: 0},
        {position: 31, inQuantity: 0}, // unused point (same inQuantity)
        {position: 32, inQuantity: 0}, // unused point (same inQuantity)
        {position: 35, inQuantity: 7},
        {position: 78, inQuantity: 8},
      ],
    },
  ]);
};
