import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RechercheActivationsEntite } from 'src/app/models/RechercheActivations';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-activations-resultats',
  templateUrl: './activations-resultats.component.html',
  styleUrls: ['./activations-resultats.component.css'],
})
export class ActivationsResultatsComponent implements OnInit {
  @Input() data: RechercheActivationsEntite[] = [];
  @Input() columnsToDisplay: string[] = [];
  @Output() sortChange = new EventEmitter<Sort>();

  constructor() {}

  ngOnInit() {
    console.log(this.data);
  }
}
