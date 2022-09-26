import {OrderDirection} from '../../models/enum/OrderDirection.enum';
import {Component, OnInit} from '@angular/core';
import {OrdreRechercheSitesProduction} from 'src/app/models/enum/OrdreRechercheSitesProduction.enum';
import {RequestForm} from 'src/app/models/RequestForm';
import {
  FormulaireRechercheSitesProduction,
  RechercheSitesProductionEntite
} from 'src/app/models/RechercheSitesProduction';
import {SitesProductionService} from 'src/app/services/api/sites-production.service';

@Component({
  selector: 'app-sites-production',
  templateUrl: './sites-production.component.html',
  styleUrls: ['./sites-production.component.css'],
})
export class SitesProductionComponent implements OnInit {
  formRecherche?: FormulaireRechercheSitesProduction;

  order = OrdreRechercheSitesProduction.producerMarketParticipantName;

  resultatsRecherche?: RechercheSitesProductionEntite[];


  constructor(
    private sitesProductionService: SitesProductionService,
  ) {
  }

  ngOnInit() {
  }

  rechercher(form: FormulaireRechercheSitesProduction) {
    this.resetResultats();
    this.formRecherche = form;
    this.lancerRecherche();
  }

  private resetResultats() {
    this.resultatsRecherche = undefined;
  }

  private lancerRecherche() {
    if (this.formRecherche != undefined) {
      const requestForm: RequestForm<OrdreRechercheSitesProduction> =
        {
          order: this.order,
          orderDirection: OrderDirection.asc,
        };
      this.sitesProductionService.rechercher(this.formRecherche, requestForm)
        .subscribe(resultat => this.resultatsRecherche = resultat);
    }
  }

  refresh() {
    this.resetResultats();
    this.lancerRecherche();
  }

}
