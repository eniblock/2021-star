import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChampDeRechercheReseauSimple } from 'src/app/models/enum/ChampDeRechercheReseauSimple.enum';
import { TechnologyType } from 'src/app/models/enum/TechnologyType.enum';

@Component({
  selector: 'app-reseau-recherche',
  templateUrl: './reseau-recherche.component.html',
  styleUrls: ['./reseau-recherche.component.css'],
})
export class ReseauRechercheComponent implements OnInit {
  ChampDeRechercheReseauSimpleEnum = ChampDeRechercheReseauSimple;
  TechnologyTypeEnum = TechnologyType;

  form: FormGroup = this.formBuilder.group({
    champPourRechercheSimple: [
      ChampDeRechercheReseauSimple.producerMarketParticipantName,
    ],
    technologyType: [[]],
    producerMarketParticipantName: [''],
    siteName: [''],
    substationName: [''],
  });

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {}

  onSubmit() {
    console.log(this.form);
  }
}
