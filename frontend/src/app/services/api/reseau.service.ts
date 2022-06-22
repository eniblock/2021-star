import {RequestForm} from '../../models/RequestForm';
import {UrlService} from './../common/url.service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  FormulaireRechercheReseau,
  RechercheReseauEntite,
  RechercheReseauRequete,
} from 'src/app/models/RechercheReseau';
import {environment} from 'src/environments/environment';
import {OrdreRechercheReseau} from 'src/app/models/enum/OrdreRechercheReseau.enum';

@Injectable({
  providedIn: 'root',
})
export class ReseauService {
  private readonly CACHE_KEY = 'formulaireRechercheReseau';

  constructor(private httpClient: HttpClient, private urlService: UrlService) {}

  rechercher(
    form: FormulaireRechercheReseau,
    requestForm: RequestForm<OrdreRechercheReseau>
  ): Observable<RechercheReseauEntite[]> {
    const formToSend: RechercheReseauRequete = {
      ...form.valeursRecherchees,
      ...requestForm,
    };
    if (form.typeDeRechercheSimple) {
      // Recherche simple => on place la valeur de recherche dans le bon champs
      formToSend[form.typeDeRechercheSimple] = form.champDeRechercheSimple;
    }
    let urlParams = this.urlService.toUrlParams(formToSend);
    return this.httpClient.get<RechercheReseauEntite[]>(
      `${environment.serverUrl}/site?${urlParams}`
    );
  }

  pushFormulaireRecherche(form: FormulaireRechercheReseau) {
    sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(form));
  }

  popFormulaireRecherche(): FormulaireRechercheReseau {
    let form = sessionStorage.getItem(this.CACHE_KEY);
    sessionStorage.removeItem(this.CACHE_KEY);
    return form == null ? null : JSON.parse(form);
  }
}
