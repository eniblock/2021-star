import { Component, OnInit } from '@angular/core';
import { OrdreRechercheReseau } from 'src/app/models/enum/OrdreRechercheReseau.enum';
import {
  FormulairePagination,
  PaginationReponse,
} from 'src/app/models/Pagination';
import {
  FormulaireRechercheReseau,
  RechercheReseauEntite,
} from 'src/app/models/RechercheReseau';
import { ReseauService } from 'src/app/services/api/reseau.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reseau',
  templateUrl: './reseau.component.html',
  styleUrls: ['./reseau.component.css'],
})
export class ReseauComponent implements OnInit {
  formRecherche?: FormulaireRechercheReseau;
  pagination: FormulairePagination<OrdreRechercheReseau> = {
    pagesize: environment.pageSizes[0],
    bookmark: null,
    order: null,
  };

  resultatRecherche?: PaginationReponse<RechercheReseauEntite>;

  constructor(private reseauService: ReseauService) {}

  ngOnInit() {}

  formSubmit(form: FormulaireRechercheReseau) {
    this.formRecherche = form;
    this.lancerRecherche();
  }

  paginationModifiee(pagination: FormulairePagination<OrdreRechercheReseau>) {
    this.pagination = pagination;
    this.lancerRecherche();
  }

  private lancerRecherche() {
    if (this.formRecherche != undefined && this.pagination != undefined) {
      const lastBookmark = this.resultatRecherche
        ? this.resultatRecherche.bookmark
        : null;
      const paginationAvecBookmark = {
        ...this.pagination,
        bookmark: lastBookmark,
      };
      this.reseauService
        .rechercher(this.formRecherche, paginationAvecBookmark)
        .subscribe((resultat) => (this.resultatRecherche = resultat));
    }
  }
}
