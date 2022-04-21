import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {environment} from "../../../../environments/environment";
import {Fichier, ListeFichiersEtEtat} from "../../micro-components/uploader-fichier/uploader-fichier.component";
import {tailleFichierToStr} from "../../micro-components/uploader-fichier/uploader-fichier-tools";
import {FormulaireOrdreDebutEtFinLimitationFichier} from "../../../models/OrdreLimitation";
import {EnergyAccountService} from "../../../services/api/energy-account.service";

@Component({
  selector: 'app-form-courbe-comptage-reference',
  templateUrl: './form-courbe-comptage-reference.component.html',
  styleUrls: ['./form-courbe-comptage-reference.component.css']
})
export class FormCourbeComptageReferenceComponent implements OnInit {
  form: FormGroup = this.formBuilder.group({});

  tailleMaxUploadFichiers = environment.tailleMaxUploadFichiers;
  tailleMaxUploadFichiersStr = '...';

  tailleFichierOk = false;
  extensionFichiersOk = false;
  listeFichiers: Fichier[] = [];
  errors: string[] = [];

  uploadEffectue = false;

  constructor(
    private formBuilder: FormBuilder,
    private energyAccountService: EnergyAccountService
  ) {}

  ngOnInit() {
    this.tailleMaxUploadFichiersStr = tailleFichierToStr(
      this.tailleMaxUploadFichiers
    );
  }

  onSubmit() {
    const form: FormulaireOrdreDebutEtFinLimitationFichier = {
      files: this.listeFichiers.map((f) => f.file),
    };
    this.energyAccountService.creer(form).subscribe(
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
