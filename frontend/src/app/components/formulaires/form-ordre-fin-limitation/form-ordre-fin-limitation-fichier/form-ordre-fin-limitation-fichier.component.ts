import { environment } from 'src/environments/environment';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PATH_ROUTE } from 'src/app/app-routing.module';
import {
  Fichier,
  ListeFichiersEtEtat,
} from 'src/app/components/micro-components/uploader-fichier/uploader-fichier.component';
import { OrdreLimitationService } from 'src/app/services/api/ordre-limitation.service';
import { tailleFichierToStr } from 'src/app/components/micro-components/uploader-fichier/uploader-fichier-tools';
import { FormulaireOrdreDebutLimitation } from 'src/app/models/OrdreLimitation';

@Component({
  selector: 'app-form-ordre-fin-limitation-fichier',
  templateUrl: './form-ordre-fin-limitation-fichier.component.html',
  styleUrls: ['./form-ordre-fin-limitation-fichier.component.css'],
})
export class FormOrdreFinLimitationFichierComponent implements OnInit {
  form: FormGroup = this.formBuilder.group({}); // Il n'y a pas besoin de formulaire ici (car seulement un fichier à uploader)

  PATH_ROUTE = PATH_ROUTE;

  tailleMaxUploadFichiers = environment.tailleMaxUploadFichiers;
  tailleMaxUploadFichiersStr = '...';

  tailleFichierOk = false;
  extensionFichiersOk = false;
  listeFichiers: Fichier[] = [];

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
    const form: FormulaireOrdreDebutLimitation = {
      fichier: this.listeFichiers[0].file, // On upload ici un seul fichier
    };
    this.ordreLimitationService
      .creerOrdreFinAvecFichier(form)
      .subscribe((ok) => {
        this.uploadEffectue = true;
      });
  }

  public modificationListeFichiers(listeFichiersEtEtat: ListeFichiersEtEtat) {
    this.tailleFichierOk = listeFichiersEtEtat.tailleFichierOk;
    this.extensionFichiersOk = listeFichiersEtEtat.extensionFichiersOk;
    this.listeFichiers = listeFichiersEtEtat.fichiers;
  }

  public chargerANouveau() {
    this.uploadEffectue = false;
  }
}
