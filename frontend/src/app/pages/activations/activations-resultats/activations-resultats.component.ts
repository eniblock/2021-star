import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges,} from '@angular/core';
import {Sort} from '@angular/material/sort';
import {InstanceService} from 'src/app/services/api/instance.service';
import {Instance} from 'src/app/models/enum/Instance.enum';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {ActivationGraphComponent} from '../activation-graph/activation-graph.component';
import {motifToString,} from 'src/app/rules/motif-rules';
import {RechercheHistoriqueLimitationEntite} from 'src/app/models/RechercheHistoriqueLimitation';
import {getLimitationType} from "../../../rules/limitation-type-rules";
import {SystemOperator} from "../../../models/SystemOperator";
import { TypeSite } from 'src/app/models/enum/TypeSite.enum';
import { TechnologyType } from 'src/app/models/enum/TechnologyType.enum';

@Component({
  selector: 'app-activations-resultats',
  templateUrl: './activations-resultats.component.html',
  styleUrls: ['./activations-resultats.component.css'],
})
export class ActivationsResultatsComponent implements OnChanges {
  @Input() data: RechercheHistoriqueLimitationEntite[] = [];
  @Input() systemOperators: SystemOperator[] = [];
  @Input() columnsToDisplay: string[] = [];
  @Output() sortChange = new EventEmitter<Sort>();

  dataComputed: any = [];

  instance?: Instance;

  constructor(
    private instanceService: InstanceService,
    private bottomSheet: MatBottomSheet,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.instanceService.getTypeInstance().subscribe((instance) => {
      this.instance = instance;
      this.computeData();
    });
  }

  private computeData() {
    var dataForComputation: RechercheHistoriqueLimitationEntite[] = [];
    for (var d of this.data) {
      if (d) {
        if (!d.site) {
          d.site = {
            typeSite: TypeSite.HTB,
            producerMarketParticipantMrid: '---',
            producerMarketParticipantName: '---',
            siteName: '---',
            technologyType: TechnologyType.PHOTOVOLTAIQUE,
            meteringPointMrid: '---',
            siteAdminMRID: '---',
            siteLocation: '---',
            siteType: '---',
            substationName: '---',
            substationMrid: '---',
            systemOperatorEntityFlexibilityDomainMrid: '---',
            systemOperatorEntityFlexibilityDomainName: '---',
            systemOperatorCustomerServiceName: '---'
          }
        }
        if (!d.producer) {
          d.producer = {
            producerMarketParticipantMrid: '---',
            producerMarketParticipantName: '---',
            producerMarketParticipantRoleType: '---'
          }
          d.activationDocument.originAutomationRegisteredResourceMrid = '---';
        }
      }
      dataForComputation.push(d);
    }

    this.dataComputed = dataForComputation.map((rhl) => {
      const limitationType = getLimitationType(rhl);
      const motif = motifToString(rhl.activationDocument);
      return {
        ...rhl,
        motif: motif,
        limitationType: limitationType,
      };
    });
  }

  showGraph(activation: RechercheHistoriqueLimitationEntite) {
    var meteringPointMrid: string = "";
    if(activation.site) {
      meteringPointMrid = activation.site.meteringPointMrid;
    }

    var dataValue = {
      meteringPointMrid: meteringPointMrid,
      startCreatedDateTime: activation.activationDocument.startCreatedDateTime,
      endCreatedDateTime: activation.activationDocument.endCreatedDateTime,
      orderValueConsign: activation.activationDocument.orderValue,
      measurementUnitNameConsign: activation.activationDocument.measurementUnitName,
    }

    this.bottomSheet.open(ActivationGraphComponent, {
      panelClass: 'graph-bottom-sheet',
      data: dataValue,
    });
  }

  public getSystemOperatorName(mrid: string): string {
    for (const op of this.systemOperators) {
      if (op.systemOperatorMarketParticipantMrid == mrid) {
        return op.systemOperatorMarketParticipantName;
      }
    }
    return "";
  }

}
