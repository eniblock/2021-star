import { Component, OnInit } from '@angular/core';
import { Instance } from 'src/app/models/enum/Instance.enum';
import { InstanceService } from 'src/app/services/api/instance.service';
import { FormulairePagination } from 'src/app/models/Pagination';
import { OrderDirection } from 'src/app/models/enum/OrderDirection.enum';
import { environment } from 'src/environments/environment';
import { PageSizeAndVisibilityFieldsEvent } from './activations-pagination/activations-pagination.component';
import { Sort } from '@angular/material/sort';
import {
  FormulaireRechercheHistoriqueLimitation,
  RechercheHistoriqueLimitationEntite,
} from 'src/app/models/RechercheHistoriqueLimitation';
import { OrdreRechercheHistoriqueLimitation } from 'src/app/models/enum/OrdreRechercheHistoriqueLimitation.enum';
import { HistoriqueLimitationService } from 'src/app/services/api/historique-limitation.service';

@Component({
  selector: 'app-activations',
  templateUrl: './activations.component.html',
  styleUrls: ['./activations.component.css'],
})
export class ActivationsComponent implements OnInit {
  formRecherche?: FormulaireRechercheHistoriqueLimitation;

  pageSize = environment.pageSizes[0];
  lastBookmark: string | null = null;
  order = OrdreRechercheHistoriqueLimitation.siteName;
  orderDirection = OrderDirection.asc;

  totalElements: number = -1;
  resultatsRecherche: RechercheHistoriqueLimitationEntite[] = [];
  afficherBoutonSuite = false;

  typeInstance?: Instance;

  columnsToDisplay: string[] = [];

  constructor(
    private instanceService: InstanceService,
    private historiqueLimitationService: HistoriqueLimitationService
  ) {}

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

  paginationModifiee(form: PageSizeAndVisibilityFieldsEvent) {
    this.resetResultats();
    this.pageSize = form.pageSize;
    this.lastBookmark = null; // Retour à la premiere page
    this.lancerRecherche();
  }

  afficherLaSuite() {
    this.lancerRecherche();
  }

  private lancerRecherche() {
    if (this.formRecherche != undefined) {
      const paginationAvecBookmark: FormulairePagination<OrdreRechercheHistoriqueLimitation> =
        {
          pageSize: this.pageSize,
          bookmark: this.lastBookmark,
          order: this.order,
          orderDirection: this.orderDirection,
        };
      this.historiqueLimitationService
        .rechercher(this.formRecherche, paginationAvecBookmark)
        .subscribe((resultat) => {
          this.lastBookmark = resultat.bookmark ? resultat.bookmark : null;
          this.totalElements = resultat.totalElements;
          this.resultatsRecherche = this.resultatsRecherche.concat(
            resultat.content
          );
          this.afficherBoutonSuite = resultat.content.length >= this.pageSize;
        });
    }
  }

  private resetResultats() {
    this.lastBookmark = null;
    this.totalElements = -1;
    this.resultatsRecherche = [];
    this.afficherBoutonSuite = false;
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
