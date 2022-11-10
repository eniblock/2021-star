import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Instance} from 'src/app/models/enum/Instance.enum';
import {InstanceService} from 'src/app/services/api/instance.service';

const ALL_TSO_COLUMNS_ID: string[] = [
  'technologyType',
  'displayedSourceName',
  'producerMarketParticipantName',
  'siteName',
  'meteringPointMrid',
  'producerMarketParticipantMrid',
  'debutLimitation',
  'finLimitation',
  'indemnisation',
  'typeLimitation',
  'quantity',
  'tarifUnitaire',
  'montantIndemnisation',
  'motif',
  'commentaires',
];

const ALL_DSO_COLUMNS_ID: string[] = [
  'technologyType',
  'displayedSourceName',
  'producerMarketParticipantName',
  'siteName',
  'meteringPointMrid',
  'producerMarketParticipantMrid',
  'debutLimitation',
  'finLimitation',
  'indemnisation',
  'typeLimitation',
  'quantity',
  'tarifUnitaire',
  'montantIndemnisation',
  'motif',
  'commentaires',
];

const ALL_PRODUCER_COLUMNS_ID: string[] = [
  'technologyType',
  'displayedSourceName',
  'siteName',
  'meteringPointMrid',
  'debutLimitation',
  'finLimitation',
  'indemnisation',
  'typeLimitation',
  'quantity',
  'tarifUnitaire',
  'montantIndemnisation',
  'motif',
  'commentaires',
];

@Component({
  selector: 'app-limitations-column-selector',
  templateUrl: './limitations-column-selector.component.html',
  styleUrls: ['./limitations-column-selector.component.css'],
})
export class LimitationsColumnSelectorComponent implements OnInit {
  @Output() columnsToDisplayChange = new EventEmitter<string[]>();

  form: FormGroup = this.formBuilder.group({
    columns: [],
  });

  allColumns: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private instanceService: InstanceService
  ) {
  }

  ngOnInit() {
    this.instanceService.getTypeInstance().subscribe((instance) => {
      this.initAllColumns(instance);
    });
  }

  private initAllColumns(instance: Instance): void {
    switch (instance) {
      case Instance.TSO:
        this.allColumns = ALL_TSO_COLUMNS_ID;
        break;
      case Instance.DSO:
        this.allColumns = ALL_DSO_COLUMNS_ID;
        break;
      case Instance.PRODUCER:
        this.allColumns = ALL_PRODUCER_COLUMNS_ID;
        break;
    }

    // Select initialisation
    this.form
      .get('columns')
      ?.setValue(this.allColumns.slice(0, this.allColumns.length));

    // Update table columns
    this.formChange();
  }

  formChange() {
    this.columnsToDisplayChange.emit(this.form.value.columns);
  }
}
