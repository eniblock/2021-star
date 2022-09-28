import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {PATH_ROUTE} from 'src/app/app-routing.module';
import {FormulaireRechercheHistoriqueLimitation} from 'src/app/models/RechercheHistoriqueLimitation';
import {FormulaireRechercheSitesProduction} from 'src/app/models/RechercheSitesProduction';
import {HistoriqueLimitationService} from 'src/app/services/api/historique-limitation.service';
import {SitesProductionService} from 'src/app/services/api/sites-production.service';
import {Instance} from "../../models/enum/Instance.enum";
import {InstanceService} from "../../services/api/instance.service";

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css'],
})
export class AccueilComponent implements OnInit {
  PATH_ROUTE = PATH_ROUTE;
  InstanceEnum = Instance;

  typeInstance?: Instance;

  constructor(
    private router: Router,
    private sitesProductionService: SitesProductionService,
    private historiqueLimitationService: HistoriqueLimitationService,
    private instanceService: InstanceService,
  ) {
  }

  ngOnInit() {
    this.instanceService.getTypeInstance()
      .subscribe((typeInstance) => this.typeInstance = typeInstance);
  }

  formRechercheSitesProductionSubmit(form: FormulaireRechercheSitesProduction) {
    this.sitesProductionService.pushFormulaireRecherche(form);
    this.router.navigate(['/', PATH_ROUTE.SITES_PRODUCTION]);
  }

  formRechercheLimitationsSubmit(
    form: FormulaireRechercheHistoriqueLimitation
  ) {
    this.historiqueLimitationService.pushFormulaireRecherche(form);
    this.router.navigate(['/', PATH_ROUTE.LIMITATIONS]);
  }
}
