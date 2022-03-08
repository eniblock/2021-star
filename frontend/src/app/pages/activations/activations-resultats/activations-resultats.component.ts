import { InstanceService } from 'src/app/services/api/instance.service';
import { Component, Input, OnInit } from '@angular/core';
import { RechercheActivationsEntite } from 'src/app/models/RechercheActivations';
import { Instance } from 'src/app/models/enum/Instance.enum';

const ALL_TSO_COLUMNS: string[] = [
  'technologyType',
  'originAutomationRegisteredResourceMrid',
  'producerMarketParticipantName',
  'siteName',
  'producerMarketParticipantMrid',
  'debutLimitation',
  'finLimitation',
  'typeLimitation',
  'quantity',
  'motif',
  'indemnisation',
];

const ALL_DSO_COLUMNS: string[] = [
  'technologyType',
  'originAutomationRegisteredResourceMrid',
  'producerMarketParticipantName',
  'siteName',
  'producerMarketParticipantMrid',
  'debutLimitation',
  'finLimitation',
  'typeLimitation',
  'quantity',
  'motif',
  'indemnisation',
];

const ALL_PRODUCER_COLUMNS: string[] = [
  'technologyType',
  'originAutomationRegisteredResourceMrid',
  'siteName',
  'debutLimitation',
  'finLimitation',
  'typeLimitation',
  'quantity',
  'motif',
  'indemnisation',
];

@Component({
  selector: 'app-activations-resultats',
  templateUrl: './activations-resultats.component.html',
  styleUrls: ['./activations-resultats.component.css'],
})
export class ActivationsResultatsComponent implements OnInit {
  @Input() data: RechercheActivationsEntite[] = [];

  columnsToDisplay: string[] = [];

  constructor(private InstanceService: InstanceService) {}

  ngOnInit() {
    this.InstanceService.getTypeInstance().subscribe((instance) =>
      this.initColumnsToDisplay(instance)
    );

    console.log(this.data);
  }

  initColumnsToDisplay(instance: Instance): void {
    switch (instance) {
      case Instance.TSO:
        this.columnsToDisplay = ALL_TSO_COLUMNS;
        break;
      case Instance.DSO:
        this.columnsToDisplay = ALL_DSO_COLUMNS;
        break;
      case Instance.PRODUCER:
        this.columnsToDisplay = ALL_PRODUCER_COLUMNS;
        break;
    }
  }
}
