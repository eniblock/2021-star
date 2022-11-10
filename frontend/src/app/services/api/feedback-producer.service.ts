import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';
import {CacheService} from '../common/cache.service';
import {Site} from "../../models/Site";

@Injectable({
  providedIn: 'root',
})
export class FeedbackProducerService {

  constructor(
    private httpClient: HttpClient,
  ) {
  }

}
