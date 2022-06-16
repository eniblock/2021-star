import {OrderDirection} from '../../models/enum/OrderDirection.enum';
import {Component, OnInit} from '@angular/core';
import {Instance} from 'src/app/models/enum/Instance.enum';
import {OrdreRechercheReseau} from 'src/app/models/enum/OrdreRechercheReseau.enum';
import {FormulairePagination} from 'src/app/models/Pagination';
import {
  FormulaireRechercheReseau,
  RechercheReseauEntite,
} from 'src/app/models/RechercheReseau';
import {InstanceService} from 'src/app/services/api/instance.service';
import {ReseauService} from 'src/app/services/api/reseau.service';
import {environment} from 'src/environments/environment';

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
    this.formRecherche = form;
    this.lancerRecherche();
  }

  private lancerRecherche() {
    if (this.formRecherche != undefined) {
      const paginationAvecBookmark: FormulairePagination<OrdreRechercheReseau> =
        {
          pageSize: 42,
          bookmark: "",
          order: this.order,
          orderDirection: OrderDirection.asc,
        };
      this.reseauService.rechercher(this.formRecherche, paginationAvecBookmark)
        .subscribe(resultat => this.resultatsRecherche = resultat.content);
    }
  }

}
