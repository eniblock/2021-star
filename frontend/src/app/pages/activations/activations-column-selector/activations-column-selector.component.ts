import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Instance } from 'src/app/models/enum/Instance.enum';
import { InstanceService } from 'src/app/services/api/instance.service';
import { activationColumnIdToChamp } from '../activations.component';

export interface ColumnDef {
  id: string;
  champ: string;
}

const ALL_TSO_COLUMNS_ID: string[] = [
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

const ALL_DSO_COLUMNS_ID: string[] = [
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

const ALL_PRODUCER_COLUMNS_ID: string[] = [
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
  selector: 'app-activations-column-selector',
  templateUrl: './activations-column-selector.component.html',
  styleUrls: ['./activations-column-selector.component.css'],
})
export class ActivationsColumnSelectorComponent implements OnInit {
  @Output() columnsToDisplayChange = new EventEmitter<string[]>();

  form: FormGroup = this.formBuilder.group({
    columns: [],
  });

  allColumns: ColumnDef[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private instanceService: InstanceService
  ) {}

  ngOnInit() {
    this.instanceService.getTypeInstance().subscribe((instance) => {
      this.initAllColumns(instance);
    });
  }

  private initAllColumns(instance: Instance): void {
    switch (instance) {
      case Instance.TSO:
        this.allColumns = ALL_TSO_COLUMNS_ID.map((id) => ({
          id: id,
          champ: activationColumnIdToChamp(id),
        }));
        break;
      case Instance.DSO:
        this.allColumns = ALL_DSO_COLUMNS_ID.map((id) => ({
          id: id,
          champ: activationColumnIdToChamp(id),
        }));
        break;
      case Instance.PRODUCER:
        this.allColumns = ALL_PRODUCER_COLUMNS_ID.map((id) => ({
          id: id,
          champ: activationColumnIdToChamp(id),
        }));
        break;
    }

    // Select initialisation
    this.form
      .get('columns')
      ?.setValue(this.allColumns.slice(0, this.allColumns.length - 4));

    // Update table columns
    this.formChange();
  }

  formChange() {
    const result = (this.form.value.columns as ColumnDef[]).map((c) => c.id);
    this.columnsToDisplayChange.emit(result);
  }
}
