import {OrderDirection} from '../../models/enum/OrderDirection.enum';
import {Component, OnInit} from '@angular/core';
import {OrdreRechercheReseau} from 'src/app/models/enum/OrdreRechercheReseau.enum';
import {RequestForm} from 'src/app/models/RequestForm';
import {FormulaireRechercheReseau, RechercheReseauEntite,} from 'src/app/models/RechercheReseau';
import {ReseauService} from 'src/app/services/api/reseau.service';

@Component({
  selector: 'app-reseau',
  templateUrl: './reseau.component.html',
  styleUrls: ['./reseau.component.css'],
})
export class ReseauComponent implements OnInit {
  formRecherche?: FormulaireRechercheReseau;

  order = OrdreRechercheReseau.producerMarketParticipantName;

  resultatsRecherche?: RechercheReseauEntite[];


  constructor(
    private reseauService: ReseauService,
  ) {
  }

  ngOnInit() {
  }

  rechercher(form: FormulaireRechercheReseau) {
    this.resetResultats();
    this.formRecherche = form;
    this.lancerRecherche();
  }

  private resetResultats() {
    this.resultatsRecherche = undefined;
  }

  private lancerRecherche() {
    if (this.formRecherche != undefined) {
      const requestForm: RequestForm<OrdreRechercheReseau> =
        {
          order: this.order,
          orderDirection: OrderDirection.asc,
        };
      this.reseauService.rechercher(this.formRecherche, requestForm)
        .subscribe(resultat => this.resultatsRecherche = resultat);
    }
  }

}
