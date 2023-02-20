import {Component, OnInit} from '@angular/core';
import {Instance} from 'src/app/models/enum/Instance.enum';
import {InstanceService} from 'src/app/services/api/instance.service';
import {
  FormulaireRechercheHistoriqueLimitation,
  RechercheHistoriqueLimitationEntiteWithAnnotation,
} from 'src/app/models/RechercheHistoriqueLimitation';
import {
  flatHistoriqueLimitation,
  HistoriqueLimitationService
} from 'src/app/services/api/historique-limitation.service';
import {DateHelper} from "../../helpers/date.helper";
import {motifToString} from "../../rules/motif-rules";
import {getLimitationType} from "../../rules/limitation-type-rules";
import {TypeLimitation} from "../../models/enum/TypeLimitation.enum";
import {IndeminityStatus} from "../../models/enum/IndeminityStatus.enum";

@Component({
  selector: 'app-limitations',
  templateUrl: './limitations.component.html',
  styleUrls: ['./limitations.component.css'],
})
export class LimitationsComponent implements OnInit {
  formRecherche?: FormulaireRechercheHistoriqueLimitation;

  loading = false;
  hasLoadSomething = false;

  researchResultsWithOnlyOneSuborder: RechercheHistoriqueLimitationEntiteWithAnnotation[] = []; // Si un ordre de limitation a plusieurs suborder => cette ligne est decoupée en autant de ligne qu'il y a de suborder
  researchResultsWithOnlyOneSuborderFiltered: RechercheHistoriqueLimitationEntiteWithAnnotation[] = [];
  dataForCSV: RechercheHistoriqueLimitationEntiteWithAnnotation[] = [];

  motifNameFilter: string | null = null;
  indeminityStatusFilter: IndeminityStatus | null = null;
  typeLimitationFilter: TypeLimitation | null = null;

  typeInstance?: Instance;

  columnsToDisplay: string[] = [];

  constructor(
    private instanceService: InstanceService,
    private historiqueLimitationService: HistoriqueLimitationService,
  ) {
  }

  ngOnInit() {
    this.instanceService.getTypeInstance().subscribe((instance) => {
      this.typeInstance = instance;
    });
  }

  rechercher(form: FormulaireRechercheHistoriqueLimitation) {
    this.resetResultats();
    this.formRecherche = {
      ...form,
      endCreatedDateTime: DateHelper.addOneDayMinusOnemillisecond(form.endCreatedDateTime),
    };
    this.lancerRecherche();
  }

  private lancerRecherche() {
    if (this.formRecherche != undefined) {
      this.loading = true;
      this.historiqueLimitationService
        .rechercher(this.formRecherche)
        .subscribe(resultat => {
          this.researchResultsWithOnlyOneSuborder = flatHistoriqueLimitation(resultat)
            .map(rhl => ({
              ...rhl,
              limitationType: getLimitationType(rhl),
              motifName: motifToString(rhl.activationDocument),
            }));
          this.researchResultsWithOnlyOneSuborderFiltered = [...this.researchResultsWithOnlyOneSuborder];
          this.loading = false;
          this.hasLoadSomething = true;
        });
    }
  }

  private resetResultats() {
    this.researchResultsWithOnlyOneSuborder = [];
    this.researchResultsWithOnlyOneSuborderFiltered = [];
  }

  updateColumnsToDisplay(columnsToDisplay: string[]) {
    this.columnsToDisplay = [...columnsToDisplay, 'actions'];
  }

  typeLimitationFilterChange(typeLimitation: TypeLimitation | null) {
    this.typeLimitationFilter = typeLimitation;
    this.filterResults();
  }

  motifNameFilterChange(motifName: string | null) {
    this.motifNameFilter = motifName;
    this.filterResults();
  }

  indeminityStatusFilterChange(indeminityStatus: IndeminityStatus | null) {
    this.indeminityStatusFilter = indeminityStatus;
    this.filterResults();
  }

  private filterResults() {
    this.researchResultsWithOnlyOneSuborderFiltered = this.researchResultsWithOnlyOneSuborder
      ?.filter(rhl => (this.typeLimitationFilter == null) ? true : rhl.limitationType == this.typeLimitationFilter)
      ?.filter(rhl => (this.motifNameFilter == null) ? true : rhl.motifName == this.motifNameFilter)
      ?.filter(rhl => (this.indeminityStatusFilter == null) ? true : rhl.feedbackProducer?.indeminityStatus == this.indeminityStatusFilter);
  }

  exportCSV() {
    this.historiqueLimitationService.exportCSV(this.dataForCSV);
  }

  dataForCSVChange(event: RechercheHistoriqueLimitationEntiteWithAnnotation[]) {
    this.dataForCSV = event;
  }
}
