import { FormulaireOrdreDebutLimitationFichier } from 'src/app/models/OrdreLimitation';
import { environment } from 'src/environments/environment';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  Fichier,
  ListeFichiersEtEtat,
} from '../../micro-components/uploader-fichier/uploader-fichier.component';
import { tailleFichierToStr } from '../../micro-components/uploader-fichier/uploader-fichier-tools';
import { OrdreLimitationService } from './../../../services/api/ordre-limitation.service';
import { PATH_ROUTE } from 'src/app/app-routing.module';

@Component({
  selector: 'app-form-ordre-debut-limitation',
  templateUrl: './form-ordre-debut-limitation.component.html',
  styleUrls: ['./form-ordre-debut-limitation.component.css'],
})
export class FormOrdreDebutLimitationComponent implements OnInit {
  form: FormGroup = this.formBuilder.group({}); // Il n'y a pas besoin de formulaire ici (car seulement un fichier à uploader)

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
    private ordreLimitationService: OrdreLimitationService
  ) {}

  ngOnInit() {
    this.tailleMaxUploadFichiersStr = tailleFichierToStr(
      this.tailleMaxUploadFichiers
    );
  }

  onSubmit() {
    const form: FormulaireOrdreDebutLimitationFichier = {
      files: this.listeFichiers.map((f) => f.file), // On upload ici un seul fichier
    };
    this.ordreLimitationService.creerOrdreDebutAvecFichiers(form).subscribe(
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
