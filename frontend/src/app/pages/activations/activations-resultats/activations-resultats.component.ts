import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Sort } from '@angular/material/sort';
import { Motif } from 'src/app/models/Motifs';
import { TypeSite } from 'src/app/models/enum/TypeSite.enum';
import { InstanceService } from 'src/app/services/api/instance.service';
import { Instance } from 'src/app/models/enum/Instance.enum';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivationGraphComponent } from '../activation-graph/activation-graph.component';
import {
  motifEnedisToString,
  motifRteToString,
} from 'src/app/rules/motif-rules';
import { whichDateMustBeShown } from 'src/app/rules/show-date-rules';
import { getLimitationType } from 'src/app/rules/limitation-type-rules';
import { RechercheHistoriqueLimitationEntite } from 'src/app/models/RechercheHistoriqueLimitation';

@Component({
  selector: 'app-activations-resultats',
  templateUrl: './activations-resultats.component.html',
  styleUrls: ['./activations-resultats.component.css'],
})
export class ActivationsResultatsComponent implements OnChanges {
  @Input() data: RechercheHistoriqueLimitationEntite[] = [];
  @Input() columnsToDisplay: string[] = [];
  @Output() sortChange = new EventEmitter<Sort>();

  TypeSite = TypeSite;

  dataComputed: any = [];

  instance?: Instance;

  constructor(
    private instanceService: InstanceService,
    private bottomSheet: MatBottomSheet
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.instanceService.getTypeInstance().subscribe((instance) => {
      this.instance = instance;
      this.computeData();
    });
  }

  private computeData() {
    this.dataComputed = this.data.map((rae) => {
      const limitationType = getLimitationType(
        rae.rte?.motif,
        rae.enedis?.motif
      );
      const motif = this.getMotif(
        rae.rte?.motif,
        rae.enedis?.motif,
        rae.typeSite,
        this.instance
      );
      const showDate = whichDateMustBeShown(rae.typeSite, rae.enedis?.motif);
      return {
        ...rae,
        showDate: showDate,
        motif: motif,
        limitationType: limitationType,
      };
    });
  }

  private getMotif(
    motifRte: Motif | undefined,
    motifEnedis: Motif | undefined,
    typeSite: TypeSite,
    instance?: Instance
  ): string {
    if (
      instance == Instance.TSO ||
      (instance == Instance.PRODUCER && typeSite == TypeSite.HTB) // A producer can see only his own site.
    ) {
      return motifRteToString(motifRte);
    } else {
      return motifEnedisToString(motifEnedis);
    }
  }

  showGraph(activation: RechercheHistoriqueLimitationEntite) {
    const operatorData =
      activation.typeSite == TypeSite.HTA ? activation.enedis : activation.rte;
    this.bottomSheet.open(ActivationGraphComponent, {
      panelClass: 'graph-bottom-sheet',
      data: {
        meteringPointMrid: activation.meteringPointMrid,
        startCreatedDateTime: operatorData?.startCreatedDateTime,
        endCreatedDateTime: operatorData?.endCreatedDateTime,
        orderValueConsign: operatorData?.orderValue,
        measurementUnitNameConsign: operatorData?.measurementUnitName,
      },
    });
  }
}
