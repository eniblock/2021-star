import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {
  FormulaireRechercheHistoriqueLimitation,
  RechercheHistoriqueLimitationEntite
} from "../../models/RechercheHistoriqueLimitation";
import {Observable, of} from "rxjs";
import {IndeminityStatus} from "../../models/enum/IndeminityStatus.enum";

@Injectable({
  providedIn: 'root',
})
export class IndeminityStatusService {
  constructor(private httpClient: HttpClient) {
  }

  public updateIndeminisationStatus(activationDocumentMrid: string): Observable<IndeminityStatus> {
    console.log(activationDocumentMrid);
    return of(IndeminityStatus.Processed);
  }

  /*
  public async UpdateActivationDocumentIndeminityStatus(ctx: Context, inputStr: string) {
    try {
      const params: STARParameters = await ParametersController.getParameterValues(ctx);
      return (await FeedbackProducerController.updateIndeminityStatus(params, inputStr));
    } catch (error) {
      throw error;
    }
  }
   */

}
