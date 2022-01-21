import { Component, OnInit } from '@angular/core';
import { OrdreRechercheReseau } from 'src/app/models/enum/OrdreRechercheReseau.enum';
import { FormulairePagination } from 'src/app/models/Pagination';
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

  pagesize = environment.pageSizes[0];
  lastBookmark: string = null;
  order = OrdreRechercheReseau.producerMarketParticipantName;

  totalElements?: number;

  resultatsRecherche: RechercheReseauEntite[] = [];

  constructor(private reseauService: ReseauService) {}

  ngOnInit() {}

  formSubmit(form: FormulaireRechercheReseau) {
    this.formRecherche = form;
    this.lancerRecherche();
  }

  paginationModifiee(form: FormulairePagination<OrdreRechercheReseau>) {
    this.pagesize = form.pagesize;
    this.order = form.order;
    this.lastBookmark = null; // Retour à la premiere page
    this.resetResultats();
    this.lancerRecherche();
  }

  private lancerRecherche() {
    if (this.formRecherche != undefined) {
      const paginationAvecBookmark: FormulairePagination<OrdreRechercheReseau> =
        {
          pagesize: this.pagesize,
          bookmark: this.lastBookmark,
          order: this.order,
        };
      this.reseauService
        .rechercher(this.formRecherche, paginationAvecBookmark)
        .subscribe((resultat) => {
          this.lastBookmark = resultat.bookmark;
          this.totalElements = resultat.totalElements;
          this.resultatsRecherche = resultat.content;
          console.log(resultat);
        });
    }
  }

  private resetResultats() {
    this.lastBookmark = null;
    this.totalElements = null;
    this.resultatsRecherche = [];
  }
}
