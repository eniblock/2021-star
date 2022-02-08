import { Component, OnInit } from '@angular/core';

export enum ModeChargement {
  ImportFichier = 'Import de fichier',
  SaisieManuelle = 'Saisie manuelle',
}

@Component({
  selector: 'app-form-ordre-fin-limitation',
  templateUrl: './form-ordre-fin-limitation.component.html',
  styleUrls: ['./form-ordre-fin-limitation.component.css'],
})
export class FormOrdreFinLimitationComponent implements OnInit {
  ModeChargement = ModeChargement;
  allModesChargement: ModeChargement[] = Object.values(ModeChargement);

  modeChargementSelected = ModeChargement.ImportFichier;

  constructor() {}

  ngOnInit() {}

  public onChangeModeChargement(modeChargement: ModeChargement) {
    this.modeChargementSelected = modeChargement;
  }
}
