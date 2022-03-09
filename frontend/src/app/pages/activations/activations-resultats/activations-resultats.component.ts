import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { RechercheActivationsEntite } from 'src/app/models/RechercheActivations';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-activations-resultats',
  templateUrl: './activations-resultats.component.html',
  styleUrls: ['./activations-resultats.component.css'],
})
export class ActivationsResultatsComponent implements OnInit, OnChanges {
  @Input() data: RechercheActivationsEntite[] = [];
  @Input() columnsToDisplay: string[] = [];
  @Output() sortChange = new EventEmitter<Sort>();

  dataComputed: any = [];

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.dataComputed = this.data.map((rae) => ({
      ...rae,
      showRteDates: true,
      showEnedisDates: true,
      motif: '??? Le motif',
      limitationType:
        '??? ' + (Math.random() > 0.5 ? 'Automatique' : 'Manuelle'),
    }));
  }
}
