import { environment } from 'src/environments/environment';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { tailleFichierToStr } from '../../micro-components/uploader-fichier/uploader-fichier-tools';
import {
  Fichier,
  ListeFichiersEtEtat,
} from '../../micro-components/uploader-fichier/uploader-fichier.component';

@Component({
  selector: 'app-form-ordre-debut-limitation',
  templateUrl: './form-ordre-debut-limitation.component.html',
  styleUrls: ['./form-ordre-debut-limitation.component.css'],
})
export class FormOrdreDebutLimitationComponent implements OnInit {
  form: FormGroup = this.formBuilder.group({}); // Il n'y a pas besoin de formulaire ici (car seulement un fichier à uploader)

  tailleMaxUploadFichiers = environment.tailleMaxUploadFichiers;
  tailleMaxUploadFichiersStr = '...';
  uploaderFichiersOk = false;
  listeFichiers: Fichier[] = [];

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.tailleMaxUploadFichiersStr = tailleFichierToStr(
      this.tailleMaxUploadFichiers
    );
  }

  onSubmit() {}

  public modificationListeFichiers(listeFichiersEtEtat: ListeFichiersEtEtat) {
    this.uploaderFichiersOk = listeFichiersEtEtat.ok;
    this.listeFichiers = listeFichiersEtEtat.fichiers;
  }
}
