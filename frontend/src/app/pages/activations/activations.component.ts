import { FormulaireRechercheActivations } from './../../models/RechercheActivations';
import { Component, OnInit } from '@angular/core';
import { Instance } from 'src/app/models/enum/Instance.enum';
import { InstanceService } from 'src/app/services/api/instance.service';
import { ActivationsService } from 'src/app/services/api/activations.service';
import { FormulairePagination } from 'src/app/models/Pagination';
import { OrdreRechercheActivations } from 'src/app/models/enum/OrdreRechercheActivations.enum';
import { OrderDirection } from 'src/app/models/enum/OrderDirection.enum';

@Component({
  selector: 'app-activations',
  templateUrl: './activations.component.html',
  styleUrls: ['./activations.component.css'],
})
export class ActivationsComponent implements OnInit {
  formRecherche?: FormulaireRechercheActivations;

  typeInstance?: Instance;

  constructor(
    private instanceService: InstanceService,
    private activationsService: ActivationsService
  ) {}

  ngOnInit() {
    this.instanceService
      .getTypeInstance()
      .subscribe((instance) => (this.typeInstance = instance));
  }

  rechercher(form: FormulaireRechercheActivations) {
    this.resetResultats();
    this.formRecherche = form;
    this.lancerRecherche();
  }

  private lancerRecherche() {
    if (this.formRecherche != undefined) {
      const paginationAvecBookmark: FormulairePagination<OrdreRechercheActivations> =
        {
          pageSize: 1, //this.pageSize,
          bookmark: '1', // this.lastBookmark,
          order: 1, //this.order,
          orderDirection: OrderDirection.asc,
        };
      this.activationsService
        .rechercher(this.formRecherche, paginationAvecBookmark)
        .subscribe((resultat) => {
          console.log(resultat);
          /*
          this.lastBookmark = resultat.bookmark ? resultat.bookmark : null;
          this.totalElements = resultat.totalElements;
          this.resultatsRecherche = this.resultatsRecherche.concat(
            resultat.content
          );
          this.afficherBoutonSuite = resultat.content.length >= this.pageSize;
          */
        });
    }
  }

  private resetResultats() {
    // Todo
  }
}
