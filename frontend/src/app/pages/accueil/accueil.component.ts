import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PATH_ROUTE } from 'src/app/app-routing.module';
import { FormulaireRechercheHistoriqueLimitation } from 'src/app/models/RechercheHistoriqueLimitation';
import { FormulaireRechercheSitesProduction } from 'src/app/models/RechercheSitesProduction';
import { HistoriqueLimitationService } from 'src/app/services/api/historique-limitation.service';
import { SitesProductionService } from 'src/app/services/api/sites-production.service';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css'],
})
export class AccueilComponent implements OnInit {
  PATH_ROUTE = PATH_ROUTE;

  constructor(
    private router: Router,
    private sitesProductionService: SitesProductionService,
    private historiqueLimitationService: HistoriqueLimitationService
  ) {}

  ngOnInit() {}

  formRechercheSitesProductionSubmit(form: FormulaireRechercheSitesProduction) {
    this.sitesProductionService.pushFormulaireRecherche(form);
    this.router.navigate(['/', PATH_ROUTE.SITES_PRODUCTION]);
  }

  formRechercheActivationsSubmit(
    form: FormulaireRechercheHistoriqueLimitation
  ) {
    this.historiqueLimitationService.pushFormulaireRecherche(form);
    this.router.navigate(['/', PATH_ROUTE.ACTIVATIONS]);
  }
}
