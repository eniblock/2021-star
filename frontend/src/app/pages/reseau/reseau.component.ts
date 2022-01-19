import { Component, OnInit } from '@angular/core';
import { Instance } from 'src/app/models/enum/Instance.enum';
import { FormulaireRechercheReseau } from 'src/app/models/RechercheReseau';
import { ReseauService } from 'src/app/services/api/reseau.service';
import { InstanceService } from './../../services/api/instance.service';

@Component({
  selector: 'app-reseau',
  templateUrl: './reseau.component.html',
  styleUrls: ['./reseau.component.css'],
})
export class ReseauComponent implements OnInit {
  instance: Instance = Instance.PRODUCER;

  constructor(
    private instanceService: InstanceService,
    private reseauService: ReseauService
  ) {}

  ngOnInit() {
    this.instanceService
      .getTypeInstance()
      .subscribe((instance) => (this.instance = instance));
  }

  rechercher(form: FormulaireRechercheReseau) {
    this.reseauService
      .find(form)
      .subscribe((rechercheReseauResponse) =>
        console.log(rechercheReseauResponse)
      );
  }
}
