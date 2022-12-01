import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IndeminityStatusService {
  constructor(private httpClient: HttpClient) {
  }

  /*
  public async UpdateActivationDocumentIndemnityStatus(ctx: Context, inputStr: string) {
    try {
      const params: STARParameters = await ParametersController.getParameterValues(ctx);
      return (await FeedbackProducerController.updateIndemnityStatus(params, inputStr));
    } catch (error) {
      throw error;
    }
  }
   */

}
