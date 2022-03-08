import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Instance } from 'src/app/models/enum/Instance.enum';
import { InstanceService } from 'src/app/services/api/instance.service';

export interface ColumnDef {
  id: string;
  label: string;
}

const ALL_TSO_COLUMNS: ColumnDef[] = [
  { id: 'technologyType', label: 'Filière' },
  { id: 'originAutomationRegisteredResourceMrid', label: 'Poste Source' },
  { id: 'producerMarketParticipantName', label: 'Nom Producteur' },
  { id: 'siteName', label: 'Nom Site' },
  { id: 'producerMarketParticipantMrid', label: 'Code Producteur' },
  { id: 'debutLimitation', label: 'Début limitation' },
  { id: 'finLimitation', label: 'Fin limitation' },
  { id: 'typeLimitation', label: 'Type de limitation' },
  { id: 'quantity', label: 'ENE/I' },
  { id: 'motif', label: 'Motif' },
  { id: 'indemnisation', label: 'Eligible indemnisation' },
];

const ALL_DSO_COLUMNS: ColumnDef[] = [
  { id: 'technologyType', label: 'Filière' },
  { id: 'originAutomationRegisteredResourceMrid', label: 'Poste Source' },
  { id: 'producerMarketParticipantName', label: 'Nom Producteur' },
  { id: 'siteName', label: 'Nom Site' },
  { id: 'producerMarketParticipantMrid', label: 'Code Producteur' },
  { id: 'debutLimitation', label: 'Début limitation' },
  { id: 'finLimitation', label: 'Fin limitation' },
  { id: 'typeLimitation', label: 'Type de limitation' },
  { id: 'quantity', label: 'ENE/I' },
  { id: 'motif', label: 'Motif' },
  { id: 'indemnisation', label: 'Eligible indemnisation' },
];

const ALL_PRODUCER_COLUMNS: ColumnDef[] = [
  { id: 'technologyType', label: 'Filière' },
  { id: 'originAutomationRegisteredResourceMrid', label: 'Poste Source' },
  { id: 'siteName', label: 'Nom Site' },
  { id: 'debutLimitation', label: 'Début limitation' },
  { id: 'finLimitation', label: 'Fin limitation' },
  { id: 'typeLimitation', label: 'Type de limitation' },
  { id: 'quantity', label: 'ENE/I' },
  { id: 'motif', label: 'Motif' },
  { id: 'indemnisation', label: 'Eligible indemnisation' },
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
        this.allColumns = ALL_TSO_COLUMNS;
        break;
      case Instance.DSO:
        this.allColumns = ALL_DSO_COLUMNS;
        break;
      case Instance.PRODUCER:
        this.allColumns = ALL_PRODUCER_COLUMNS;
        break;
    }
    this.form.get('columns')?.setValue(this.allColumns);
  }

  formChange() {
    console.log(this.form.value.columns);
  }
}
