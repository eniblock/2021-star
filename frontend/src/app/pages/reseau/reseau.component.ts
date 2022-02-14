import { Component, OnInit } from '@angular/core';
import { Instance } from 'src/app/models/enum/Instance.enum';
import { OrdreRechercheReseau } from 'src/app/models/enum/OrdreRechercheReseau.enum';
import { FormulairePagination } from 'src/app/models/Pagination';
import {
  FormulaireRechercheReseau,
  RechercheReseauEntite,
} from 'src/app/models/RechercheReseau';
import { InstanceService } from 'src/app/services/api/instance.service';
import { ReseauService } from 'src/app/services/api/reseau.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reseau',
  templateUrl: './reseau.component.html',
  styleUrls: ['./reseau.component.css'],
})
export class ReseauComponent implements OnInit {
  formRecherche?: FormulaireRechercheReseau;

<<<<<<< HEAD
  pageSize = environment.pageSizes[0];
=======
  pagesize = environment.pageSizes[0];
>>>>>>> develop
  lastBookmark: string | null = null;
  order = OrdreRechercheReseau.producerMarketParticipantName;

  totalElements: number = -1;

  resultatsRecherche: RechercheReseauEntite[] = [];

  afficherBoutonSuite = false;

  typeInstance?: Instance;

  constructor(
    private reseauService: ReseauService,
    private instanceService: InstanceService
  ) {}

  ngOnInit() {
    this.instanceService
      .getTypeInstance()
      .subscribe((instance) => (this.typeInstance = instance));
  }

  rechercher(form: FormulaireRechercheReseau) {
    this.resetResultats();
    this.formRecherche = form;
    this.lancerRecherche();
  }

  paginationModifiee(form: FormulairePagination<OrdreRechercheReseau>) {
    this.resetResultats();
<<<<<<< HEAD
    this.pageSize = form.pageSize;
=======
    this.pagesize = form.pagesize;
>>>>>>> develop
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
<<<<<<< HEAD
          pageSize: this.pageSize,
=======
          pagesize: this.pagesize,
>>>>>>> develop
          bookmark: this.lastBookmark,
          order: this.order,
        };
      this.reseauService
        .rechercher(this.formRecherche, paginationAvecBookmark)
        .subscribe((resultat) => {
          this.lastBookmark = resultat.bookmark ? resultat.bookmark : null;
          this.totalElements = resultat.totalElements;
          this.resultatsRecherche = this.resultatsRecherche.concat(
            resultat.content
          );
<<<<<<< HEAD
          this.afficherBoutonSuite = resultat.content.length >= this.pageSize;
=======
          this.afficherBoutonSuite = resultat.content.length >= this.pagesize;
>>>>>>> develop
        });
    }
  }

  private resetResultats() {
    this.lastBookmark = null;
    this.totalElements = -1;
    this.resultatsRecherche = [];
    this.afficherBoutonSuite = false;
  }
}
