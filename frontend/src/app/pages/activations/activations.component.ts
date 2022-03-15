import {
  FormulaireRechercheActivations,
  RechercheActivationsEntite,
} from './../../models/RechercheActivations';
import { Component, OnInit } from '@angular/core';
import { Instance } from 'src/app/models/enum/Instance.enum';
import { InstanceService } from 'src/app/services/api/instance.service';
import { ActivationsService } from 'src/app/services/api/activations.service';
import { FormulairePagination } from 'src/app/models/Pagination';
import { OrdreRechercheActivations } from 'src/app/models/enum/OrdreRechercheActivations.enum';
import { OrderDirection } from 'src/app/models/enum/OrderDirection.enum';
import { environment } from 'src/environments/environment';
import { PageSizeAndVisibilityFieldsEvent } from './activations-pagination/activations-pagination.component';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-activations',
  templateUrl: './activations.component.html',
  styleUrls: ['./activations.component.css'],
})
export class ActivationsComponent implements OnInit {
  formRecherche?: FormulaireRechercheActivations;

  pageSize = environment.pageSizes[0];
  lastBookmark: string | null = null;
  order = OrdreRechercheActivations.siteName;
  orderDirection = OrderDirection.asc;

  totalElements: number = -1;
  resultatsRecherche: RechercheActivationsEntite[] = [];
  afficherBoutonSuite = false;

  typeInstance?: Instance;

  columnsToDisplay: string[] = [];

  constructor(
    private instanceService: InstanceService,
    private activationsService: ActivationsService
  ) {}

  ngOnInit() {
    this.instanceService.getTypeInstance().subscribe((instance) => {
      this.typeInstance = instance;
    });
  }

  rechercher(form: FormulaireRechercheActivations) {
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
      const paginationAvecBookmark: FormulairePagination<OrdreRechercheActivations> =
        {
          pageSize: this.pageSize,
          bookmark: this.lastBookmark,
          order: this.order,
          orderDirection: this.orderDirection,
        };
      this.activationsService
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
    this.columnsToDisplay = columnsToDisplay;
  }

  sortChange(sort: Sort) {
    if (sort.direction != '') {
      this.order = (OrdreRechercheActivations as any)[sort.active];
      this.orderDirection = sort.direction as any;
    } else {
      this.order = OrdreRechercheActivations.siteName;
      this.orderDirection = OrderDirection.asc;
    }
    this.resetResultats();
    this.lancerRecherche();
  }
}
