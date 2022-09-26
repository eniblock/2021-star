import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA} from "@angular/material/bottom-sheet";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {environment} from "../../../../environments/environment";
import {
  Fichier,
  ListeFichiersEtEtat
} from "../../micro-components/uploader-fichier/uploader-fichier.component";

@Component({
  selector: 'app-form-ajout-tarif-unitaire',
  templateUrl: './form-ajout-tarif-unitaire.component.html',
  styleUrls: ['./form-ajout-tarif-unitaire.component.css']
})
export class FormAjoutTarifUnitaireComponent implements OnInit {
  form: FormGroup = this.formBuilder.group({
    energyPriceAmount: ['', [Validators.required, Validators.pattern('[0-9]*[\,\.]?[0-9]*')]],
    validityPeriodStartDateTime: [''],
  });

  loading = false;

  tailleMaxUploadFichiers = environment.tailleMaxUploadFichiers;
  tailleMaxUploadFichiersStr = environment.tailleMaxUploadFichiers / 1000000 + " Mo";

  tailleFichierOk = false;
  extensionFichiersOk = false;
  listeFichiers: Fichier[] = [];
  errors: string[] = [];

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public bottomSheetParams: {
      meteringPointMrid: string;
    },
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit(): void {
  }

  public modificationListeFichiers(listeFichiersEtEtat: ListeFichiersEtEtat) {
    this.tailleFichierOk = listeFichiersEtEtat.tailleFichierOk;
    this.extensionFichiersOk = listeFichiersEtEtat.extensionFichiersOk;
    this.listeFichiers = listeFichiersEtEtat.fichiers;
  }

  onSubmit() {
    // TODO : energyPriceAmount est un number
    // TODO : validityPeriodStartDateTime est un dateTime => ajouter Z00:00:00
  }

}
