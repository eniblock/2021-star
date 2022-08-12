import {RequestForm} from '../../models/RequestForm';
import {UrlService} from './../common/url.service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  FormulaireRechercheSitesProduction,
  RechercheSitesProductionEntite,
  RechercheSitesProductionRequete,
} from 'src/app/models/RechercheSitesProduction';
import {environment} from 'src/environments/environment';
import {OrdreRechercheSitesProduction} from 'src/app/models/enum/OrdreRechercheSitesProduction.enum';

@Injectable({
  providedIn: 'root',
})
export class SitesProductionService {
  private readonly CACHE_KEY = 'FormulaireRechercheSitesProduction';

  constructor(private httpClient: HttpClient, private urlService: UrlService) {}

  rechercher(
    form: FormulaireRechercheSitesProduction,
    requestForm: RequestForm<OrdreRechercheSitesProduction>
  ): Observable<RechercheSitesProductionEntite[]> {
    const formToSend: RechercheSitesProductionRequete = {
      ...form.valeursRecherchees,
      ...requestForm,
    };
    if (form.typeDeRechercheSimple) {
      // Recherche simple => on place la valeur de recherche dans le bon champs
      formToSend[form.typeDeRechercheSimple] = form.champDeRechercheSimple;
    }
    let urlParams = this.urlService.toUrlParams(formToSend);
    return this.httpClient.get<RechercheSitesProductionEntite[]>(
      `${environment.serverUrl}/site?${urlParams}`
    );
  }

  pushFormulaireRecherche(form: FormulaireRechercheSitesProduction) {
    sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(form));
  }

  popFormulaireRecherche(): FormulaireRechercheSitesProduction {
    let form = sessionStorage.getItem(this.CACHE_KEY);
    sessionStorage.removeItem(this.CACHE_KEY);
    return form == null ? null : JSON.parse(form);
  }
}
