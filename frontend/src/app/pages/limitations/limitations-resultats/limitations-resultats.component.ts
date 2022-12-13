import {Component, Input, OnChanges, SimpleChanges,} from '@angular/core';
import {Sort} from '@angular/material/sort';
import {InstanceService} from 'src/app/services/api/instance.service';
import {Instance} from 'src/app/models/enum/Instance.enum';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {LimitationsGraphComponent} from '../limitations-graph/limitations-graph.component';
import {
  RechercheHistoriqueLimitationEntite,
  RechercheHistoriqueLimitationEntiteWithAnnotation
} from 'src/app/models/RechercheHistoriqueLimitation';
import {SystemOperator} from "../../../models/SystemOperator";
import {TypeSite} from 'src/app/models/enum/TypeSite.enum';
import {DateHelper} from "../../../helpers/date.helper";
import {EligibilityStatus} from "../../../models/enum/EligibilityStatus.enum";
import {Router} from "@angular/router";
import {PATH_ROUTE} from "../../../app-routing.module";
import {TypeImport} from "../../charger/charger.component";
import {FeedbackProducer} from "../../../models/FeedbackProducer";

@Component({
  selector: 'app-limitations-resultats',
  templateUrl: './limitations-resultats.component.html',
  styleUrls: ['./limitations-resultats.component.css'],
})
export class LimitationsResultatsComponent implements OnChanges {
  @Input() data: RechercheHistoriqueLimitationEntiteWithAnnotation[] = [];
  @Input() systemOperators: SystemOperator[] = [];
  @Input() columnsToDisplay: string[] = [];

  InstanceEnum = Instance;
  TypeSiteEnum = TypeSite;

  dataSorted: RechercheHistoriqueLimitationEntiteWithAnnotation[] = [];

  instance?: Instance;

  constructor(
    private instanceService: InstanceService,
    private bottomSheet: MatBottomSheet,
    private router: Router,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.instanceService.getTypeInstance().subscribe((instance) => {
      this.instance = instance;
      this.dataSorted = [...this.data];
    });
  }

  showGraph(activation: RechercheHistoriqueLimitationEntite) {
    var meteringPointMrid: string = "";
    if (activation.site) {
      meteringPointMrid = activation.site.meteringPointMrid;
    }

    var dataValue = {
      meteringPointMrid: meteringPointMrid,
      startCreatedDateTime: activation.activationDocument.startCreatedDateTime,
      endCreatedDateTime: activation.activationDocument.endCreatedDateTime,
      orderValueConsign: activation.activationDocument.orderValue,
      measurementUnitNameConsign: activation.activationDocument.measurementUnitName,
      showOnlyConsign: this.instance == Instance.PRODUCER && activation.activationDocument.eligibilityStatus != EligibilityStatus.OUI,
    }

    this.bottomSheet.open(LimitationsGraphComponent, {
      panelClass: 'graph-bottom-sheet',
      data: dataValue,
    });
  }

  public sortChange(sort: Sort) {
    // 1) No sort case
    if (sort.direction == "") {
      this.dataSorted = [...this.data];
      return;
    }

    // 2) Find the sorting method
    let sortFunction: any = null;
    switch (sort.active) {
      case "debutLimitation":
        sortFunction = (d1: any, d2: any): number => {
          let ts1 = DateHelper.stringToTimestamp(d1.activationDocument.startCreatedDateTime);
          let ts2 = DateHelper.stringToTimestamp(d2.activationDocument.startCreatedDateTime);
          return sort.direction == "asc" ? ts1 - ts2 : ts2 - ts1;
        };
        break;
      case "finLimitation":
        sortFunction = (d1: any, d2: any): number => {
          let ts1 = DateHelper.stringToTimestamp(d1.activationDocument.endCreatedDateTime);
          let ts2 = DateHelper.stringToTimestamp(d2.activationDocument.endCreatedDateTime);
          return sort.direction == "asc" ? ts1 - ts2 : ts2 - ts1;
        };
        break;
    }

    // 3) Sort data
    if (sortFunction != null) {
      this.dataSorted = [...this.data].sort((d1: any, d2: any) => sortFunction(d1, d2));
    }
  }

  public chargerEne(activation: RechercheHistoriqueLimitationEntite) {
    this.router.navigate(
      [PATH_ROUTE.CHARGER],
      {
        state: {
          typeImport: TypeImport.EneEni,
          formData: activation
        }
      });
  }

  prettyPrint(element: any) {
    return element === null ? "" : element;
  }

  feedbackChange(feedbackProducer: FeedbackProducer, historiqueLimitation: RechercheHistoriqueLimitationEntite) {
    if (feedbackProducer) {
      let dataIndex = this.data.findIndex(v => v == historiqueLimitation);
      let dataSortedIndex = this.dataSorted.findIndex(v => v == historiqueLimitation);
      if (dataIndex != -1) {
        this.data[dataIndex].feedbackProducer = feedbackProducer;
      }
      if (dataSortedIndex != -1) {
        this.dataSorted[dataSortedIndex].feedbackProducer = feedbackProducer;
        this.dataSorted[dataSortedIndex] = {...this.dataSorted[dataSortedIndex]}; // To update view
        this.dataSorted = [...this.dataSorted]; // To update view
      }
    }
  }

}
