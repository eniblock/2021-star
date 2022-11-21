import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FeedbackProducerService {

  constructor(
    private httpClient: HttpClient,
  ) {
  }

  postFeedbackProducer(activationDocumentMrid: string, message: string, elements: string): Observable<void> {
    const formData = {
      activationDocumentMrid: activationDocumentMrid,
      feedbackStr: message,
      feedbackElements: elements,
    };
    return this.httpClient.post<void>(`${environment.serverUrl}/feedback`, formData);
  }

  postFeedbackProducerAnswer(activationDocumentMrid: string, message: string) {
    const formData = {
      activationDocumentMrid: activationDocumentMrid,
      answerStr: message,
    };
    return this.httpClient.post<void>(`${environment.serverUrl}/feedback/answer`, formData);

  }
}
