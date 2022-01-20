import { Component, OnInit } from '@angular/core';
import { Instance } from 'src/app/models/enum/Instance.enum';
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
import { InstanceService } from 'src/app/services/api/instance.service';

@Component({
  selector: 'app-reseau',
  templateUrl: './reseau.component.html',
  styleUrls: ['./reseau.component.css'],
})
export class ReseauComponent implements OnInit {
  instance: Instance = Instance.PRODUCER;

  formRecherche?: FormulaireRechercheReseau;
  pagination: FormulairePagination<OrdreRechercheReseau> = {
    pagesize: environment.pageSizes[0],
    bookmark: null,
    order: null,
  };

  resultatRecherche?: PaginationReponse<RechercheReseauEntite>;

  constructor(
    private instanceService: InstanceService,
    private reseauService: ReseauService
  ) {}

  ngOnInit() {
    this.instanceService
      .getTypeInstance()
      .subscribe((instance) => (this.instance = instance));
  }

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
      this.reseauService
        .rechercher(this.formRecherche, this.pagination)
        .subscribe((resultat) => (this.resultatRecherche = resultat));
    }
  }
}
