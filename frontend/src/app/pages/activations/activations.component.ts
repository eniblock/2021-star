import {Component, OnInit} from '@angular/core';
import {Instance} from 'src/app/models/enum/Instance.enum';
import {InstanceService} from 'src/app/services/api/instance.service';
import {OrderDirection} from 'src/app/models/enum/OrderDirection.enum';
import {Sort} from '@angular/material/sort';
import {
  FormulaireRechercheHistoriqueLimitation,
  RechercheHistoriqueLimitationEntite,
} from 'src/app/models/RechercheHistoriqueLimitation';
import {OrdreRechercheHistoriqueLimitation} from 'src/app/models/enum/OrdreRechercheHistoriqueLimitation.enum';
import {HistoriqueLimitationService} from 'src/app/services/api/historique-limitation.service';
import {RequestForm} from "../../models/RequestForm";

@Component({
  selector: 'app-activations',
  templateUrl: './activations.component.html',
  styleUrls: ['./activations.component.css'],
})
export class ActivationsComponent implements OnInit {
  formRecherche?: FormulaireRechercheHistoriqueLimitation;

  order = OrdreRechercheHistoriqueLimitation.siteName;
  orderDirection = OrderDirection.asc;

  resultatsRecherche?: RechercheHistoriqueLimitationEntite[];

  typeInstance?: Instance;

  columnsToDisplay: string[] = [];

  constructor(
    private instanceService: InstanceService,
    private historiqueLimitationService: HistoriqueLimitationService
  ) {
  }

  ngOnInit() {
    this.instanceService.getTypeInstance().subscribe((instance) => {
      this.typeInstance = instance;
    });
  }

  rechercher(form: FormulaireRechercheHistoriqueLimitation) {
    this.resetResultats();
    this.formRecherche = form;
    this.lancerRecherche();
  }

  private lancerRecherche() {
    if (this.formRecherche != undefined) {
      const paginationAvecBookmark: RequestForm<OrdreRechercheHistoriqueLimitation> =
        {
          order: this.order,
          orderDirection: this.orderDirection,
        };
      this.historiqueLimitationService
        .rechercher(this.formRecherche, paginationAvecBookmark)
        .subscribe(resultat => this.resultatsRecherche = resultat);
    }
  }

  private resetResultats() {
    this.resultatsRecherche = undefined;
  }

  updateColumnsToDisplay(columnsToDisplay: string[]) {
    this.columnsToDisplay = [...columnsToDisplay, 'actions'];
  }

  sortChange(sort: Sort) {
    if (sort.direction != '') {
      this.order = (OrdreRechercheHistoriqueLimitation as any)[sort.active];
      this.orderDirection = sort.direction as any;
    } else {
      this.order = OrdreRechercheHistoriqueLimitation.siteName;
      this.orderDirection = OrderDirection.asc;
    }
    this.resetResultats();
    this.lancerRecherche();
  }
}
