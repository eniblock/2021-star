import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {environment} from "../../../../../environments/environment";
import {Fichier, ListeFichiersEtEtat} from "../../../micro-components/uploader-fichier/uploader-fichier.component";
import {tailleFichierToStr} from "../../../micro-components/uploader-fichier/uploader-fichier-tools";
import {PATH_ROUTE} from 'src/app/app-routing.module';
import {EnergyAmountService} from "../../../../services/api/energy-amount.service";
import {FormulaireEnergyAmountFile} from "../../../../models/EnergyAmount";

@Component({
  selector: 'app-form-ene-eni-fichier',
  templateUrl: './form-ene-eni-fichier.component.html',
  styleUrls: ['./form-ene-eni-fichier.component.css']
})
export class FormEneEniFichierComponent implements OnInit {

  form: FormGroup = this.formBuilder.group({});

  PATH_ROUTE = PATH_ROUTE;

  tailleMaxUploadFichiers = environment.tailleMaxUploadFichiers;
  tailleMaxUploadFichiersStr = '...';

  tailleFichierOk = false;
  extensionFichiersOk = false;
  listeFichiers: Fichier[] = [];
  errors: string[] = [];

  uploadEffectue = false;

  constructor(
    private formBuilder: FormBuilder,
    private energyAmountService: EnergyAmountService
  ) {
  }

  ngOnInit() {
    this.tailleMaxUploadFichiersStr = tailleFichierToStr(
      this.tailleMaxUploadFichiers
    );
  }

  onSubmit() {
    const form: FormulaireEnergyAmountFile = {
      files: this.listeFichiers.map((f) => f.file),
    };
    this.energyAmountService.createWithFile(form).subscribe(
      (ok) => {
        this.uploadEffectue = true;
      },
      (error) => {
        this.errors = error.error.errors;
      }
    );
  }

  public modificationListeFichiers(listeFichiersEtEtat: ListeFichiersEtEtat) {
    this.tailleFichierOk = listeFichiersEtEtat.tailleFichierOk;
    this.extensionFichiersOk = listeFichiersEtEtat.extensionFichiersOk;
    this.listeFichiers = listeFichiersEtEtat.fichiers;
  }

  public chargerANouveau() {
    this.tailleFichierOk = false;
    this.extensionFichiersOk = false;
    this.listeFichiers = [];
    this.uploadEffectue = false;
  }

}
