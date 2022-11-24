import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IndemnityStatusService {
  constructor(private httpClient: HttpClient) {
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
