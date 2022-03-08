import { InstanceService } from 'src/app/services/api/instance.service';
import { Component, Input, OnInit } from '@angular/core';
import { RechercheActivationsEntite } from 'src/app/models/RechercheActivations';
import { activationColumnIdToChamp } from '../activations.component';

@Component({
  selector: 'app-activations-resultats',
  templateUrl: './activations-resultats.component.html',
  styleUrls: ['./activations-resultats.component.css'],
})
export class ActivationsResultatsComponent implements OnInit {
  @Input() data: RechercheActivationsEntite[] = [];
  @Input() columnsToDisplay: string[] = [];

  activationColumnIdToChamp = activationColumnIdToChamp;

  constructor(private InstanceService: InstanceService) {}

  ngOnInit() {
    console.log(this.data);
  }
}
