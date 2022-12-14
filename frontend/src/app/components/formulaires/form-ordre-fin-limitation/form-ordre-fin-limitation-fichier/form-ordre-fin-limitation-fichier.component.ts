import { environment } from 'src/environments/environment';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  Fichier,
  ListeFichiersEtEtat,
} from 'src/app/components/micro-components/uploader-fichier/uploader-fichier.component';
import { OrdreLimitationService } from 'src/app/services/api/ordre-limitation.service';
import { tailleFichierToStr } from 'src/app/components/micro-components/uploader-fichier/uploader-fichier-tools';
import { FormulaireOrdreFinLimitationFichier } from 'src/app/models/OrdreLimitation';

@Component({
  selector: 'app-form-ordre-fin-limitation-fichier',
  templateUrl: './form-ordre-fin-limitation-fichier.component.html',
  styleUrls: ['./form-ordre-fin-limitation-fichier.component.css'],
})
export class FormOrdreFinLimitationFichierComponent implements OnInit {
  form: FormGroup = this.formBuilder.group({});

  loading = false;

  tailleMaxUploadFichiers = environment.tailleMaxUploadFichiers;
  tailleMaxUploadFichiersStr = environment.tailleMaxUploadFichiers / 1000000 + " Mo";

  tailleFichierOk = false;
  extensionFichiersOk = false;
  listeFichiers: Fichier[] = [];
  errors: string[] = [];

  uploadEffectue = false;

  constructor(
    private formBuilder: FormBuilder,
    private ordreLimitationService: OrdreLimitationService
  ) {}

  ngOnInit() {
    this.tailleMaxUploadFichiersStr = tailleFichierToStr(
      this.tailleMaxUploadFichiers
    );
  }

  onSubmit() {
    this.loading = true;
    const form: FormulaireOrdreFinLimitationFichier = {
      files: this.listeFichiers.map((f) => f.file),
    };
    this.ordreLimitationService.creerOrdreFinAvecFichiers(form).subscribe(
      (ok) => {
        this.loading = false;
        this.uploadEffectue = true;
      },
      (error) => {
        this.loading = false;
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
