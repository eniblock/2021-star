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

  afficherBoutonSuite = false;

  constructor(private reseauService: ReseauService) {}

  ngOnInit() {}

  rechercher(form: FormulaireRechercheReseau) {
    this.resetResultats();
    this.formRecherche = form;
    this.lancerRecherche();
  }

  paginationModifiee(form: FormulairePagination<OrdreRechercheReseau>) {
    this.resetResultats();
    this.pagesize = form.pagesize;
    this.order = form.order;
    this.lastBookmark = null; // Retour à la premiere page
    this.lancerRecherche();
  }

  afficherLaSuite() {
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
          this.resultatsRecherche = this.resultatsRecherche.concat(
            resultat.content
          );
          this.afficherBoutonSuite = resultat.content.length >= this.pagesize;
          console.log(resultat);
        });
    }
  }

  private resetResultats() {
    this.lastBookmark = null;
    this.totalElements = null;
    this.resultatsRecherche = [];
    this.afficherBoutonSuite = false;
  }
}
