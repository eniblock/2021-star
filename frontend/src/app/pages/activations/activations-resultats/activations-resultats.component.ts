import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges,} from '@angular/core';
import {Sort} from '@angular/material/sort';
import {Motif} from 'src/app/models/Motifs';
import {TypeSite} from 'src/app/models/enum/TypeSite.enum';
import {InstanceService} from 'src/app/services/api/instance.service';
import {Instance} from 'src/app/models/enum/Instance.enum';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {ActivationGraphComponent} from '../activation-graph/activation-graph.component';
import {motifEnedisToString, motifRteToString,} from 'src/app/rules/motif-rules';
import {RechercheHistoriqueLimitationEntite} from 'src/app/models/RechercheHistoriqueLimitation';
import {getLimitationType} from "../../../rules/limitation-type-rules";

@Component({
  selector: 'app-activations-resultats',
  templateUrl: './activations-resultats.component.html',
  styleUrls: ['./activations-resultats.component.css'],
})
export class ActivationsResultatsComponent implements OnChanges {
  @Input() data: RechercheHistoriqueLimitationEntite[] = [];
  @Input() columnsToDisplay: string[] = [];
  @Output() sortChange = new EventEmitter<Sort>();

  dataComputed: any = [];

  instance?: Instance;

  constructor(
    private instanceService: InstanceService,
    private bottomSheet: MatBottomSheet
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.instanceService.getTypeInstance().subscribe((instance) => {
      this.instance = instance;
      this.computeData();
    });
  }

  private computeData() {
    this.dataComputed = this.data.map((rhl) => {
      const limitationType = getLimitationType(rhl);
      /*
      const motif = this.getMotif(        => mettre cette fonction dans "motif-rules.ts"
        rhl.rte?.motif,
        rhl.enedis?.motif,
        rhl.typeSite,
        this.instance
      );
      const showDate = whichDateMustBeShown(rhl.typeSite, rhl.enedis?.motif);
       */
      return {
        ...rhl,
        motif: 'TODO !!!',
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
    this.bottomSheet.open(ActivationGraphComponent, {
      panelClass: 'graph-bottom-sheet',
      data: {
        meteringPointMrid: activation.site.meteringPointMrid,
        startCreatedDateTime: activation.ordreLimitation.startCreatedDateTime,
        endCreatedDateTime: activation.ordreLimitation.endCreatedDateTime,
        orderValueConsign: activation.ordreLimitation.orderValue,
        measurementUnitNameConsign: activation.ordreLimitation.measurementUnitName,
      },
    });
  }
}
