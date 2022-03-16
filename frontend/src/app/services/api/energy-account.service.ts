import { UrlService } from './../common/url.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EnergyAccount } from 'src/app/models/EnergyAccount';
import { MeasurementUnitName } from 'src/app/models/enum/MeasurementUnitName.enum';
import { ProcessType } from 'src/app/models/enum/ProcessType.enum';
import { PaginationReponse } from 'src/app/models/Pagination';
import { RechercheActivationsEntite } from 'src/app/models/RechercheActivations';
import { environment } from 'src/environments/environment';

const MOCK = true;

@Injectable({
  providedIn: 'root',
})
export class EnergyAccountService {
  constructor(private httpClient: HttpClient, private urlService: UrlService) {}

  find(
    meteringPointMrid: string,
    startCreatedDateTime: string,
    endCreatedDateTime: string
  ): Observable<EnergyAccount[]> {
    if (MOCK) {
      console.log(meteringPointMrid, startCreatedDateTime, endCreatedDateTime);
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
}

/* *********************************************************
                               MOCKS
   ********************************************************* */
const getMocks = (): Observable<EnergyAccount[]> => {
  return of([
    {
      processType: ProcessType.A05,
      timeInterval: '2020-01-01T00:00:00/2020-01-01T23:59:59',
      resolution: 'PT10M',
      measurementUnitName: MeasurementUnitName.MW,
      energyAccountPoints: [
        { inQuantity: 1, position: 2 },
        { inQuantity: 2, position: 5 },
        { inQuantity: 3, position: 5 },
        { inQuantity: 20, position: 7 },
        { inQuantity: 25, position: 8 },
      ],
    },
    {
      processType: ProcessType.A05,
      timeInterval: '2020-01-02T00:00:00/2020-01-02T23:59:59',
      resolution: 'PT5M',
      measurementUnitName: MeasurementUnitName.MW,
      energyAccountPoints: [
        { inQuantity: 1, position: 2 },
        { inQuantity: 4, position: 5 },
        { inQuantity: 30, position: 0 },
        { inQuantity: 31, position: 0 },
        { inQuantity: 32, position: 0 },
        { inQuantity: 35, position: 7 },
        { inQuantity: 78, position: 8 },
      ],
    },
  ]);
};
