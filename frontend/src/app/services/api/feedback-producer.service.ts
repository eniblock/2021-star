import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';
import {FeedbackProducer} from "../../models/FeedbackProducer";

@Injectable({
  providedIn: 'root',
})
export class FeedbackProducerService {

  constructor(
    private httpClient: HttpClient,
  ) {
  }

  postFeedbackProducer(activationDocumentMrid: string, message: string, elements: string): Observable<FeedbackProducer | null> {
    const formData = {
      activationDocumentMrid: activationDocumentMrid,
      feedback: message,
      feedbackElements: elements,
    };
    return this.httpClient.post<FeedbackProducer | null>(`${environment.serverUrl}/feedback`, formData);
  }

  postFeedbackProducerAnswer(activationDocumentMrid: string, message: string): Observable<FeedbackProducer | null> {
    const formData = {
      activationDocumentMrid: activationDocumentMrid,
      feedbackAnswer: message,
    };
    return this.httpClient.post<FeedbackProducer | null>(`${environment.serverUrl}/feedback/answer`, formData);
  }
}
