import {Component, OnInit} from '@angular/core';
import {Instance} from 'src/app/models/enum/Instance.enum';
import {InstanceService} from 'src/app/services/api/instance.service';
import {
  FormulaireRechercheHistoriqueLimitation,
  RechercheHistoriqueLimitationEntite,
} from 'src/app/models/RechercheHistoriqueLimitation';
import {
  flatHistoriqueLimitation,
  HistoriqueLimitationService
} from 'src/app/services/api/historique-limitation.service';
import {SystemOperatorService} from "../../services/api/system-operator.service";
import {SystemOperator} from "../../models/SystemOperator";
import {DateHelper} from "../../helpers/date.helper";

@Component({
  selector: 'app-activations',
  templateUrl: './activations.component.html',
  styleUrls: ['./activations.component.css'],
})
export class ActivationsComponent implements OnInit {
  formRecherche?: FormulaireRechercheHistoriqueLimitation;

  resultatsRechercheWithOnlyOneSubOrderByOrder?: RechercheHistoriqueLimitationEntite[]; // Si un ordre de limitation a plusieurs suborder => cette ligne est decoupée en autant de ligne qu'il y a de suborder

  typeInstance?: Instance;
  systemOperators: SystemOperator[] = [];

  columnsToDisplay: string[] = [];

  constructor(
    private instanceService: InstanceService,
    private historiqueLimitationService: HistoriqueLimitationService,
    private systemOperatorService: SystemOperatorService,
  ) {
  }

  ngOnInit() {
    this.instanceService.getTypeInstance().subscribe((instance) => {
      this.typeInstance = instance;
    });
    this.systemOperatorService.getSystemOperators().subscribe(systemOperators =>
      this.systemOperators = systemOperators
    );
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
      this.historiqueLimitationService
        .rechercher(this.formRecherche)
        .subscribe(resultat => this.resultatsRechercheWithOnlyOneSubOrderByOrder = flatHistoriqueLimitation(resultat));
    }
  }

  private resetResultats() {
    this.resultatsRechercheWithOnlyOneSubOrderByOrder = undefined;
  }

  updateColumnsToDisplay(columnsToDisplay: string[]) {
    this.columnsToDisplay = [...columnsToDisplay, 'actions'];
  }

}
