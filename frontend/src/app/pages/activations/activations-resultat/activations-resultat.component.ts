import { Component, Input, OnInit } from '@angular/core';
import { RechercheActivationsEntite } from 'src/app/models/RechercheActivations';

@Component({
  selector: 'app-activations-resultat',
  templateUrl: './activations-resultat.component.html',
  styleUrls: ['./activations-resultat.component.css'],
})
export class ActivationsResultatComponent implements OnInit {
  @Input() data: RechercheActivationsEntite[] = [];

  columnsToDisplay: string[] = [
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

  constructor() {}

  ngOnInit() {
    console.log(this.data);
  }
}
