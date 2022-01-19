import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TechnologyType } from 'src/app/models/enum/TechnologyType.enum';
import { TypeDeRechercheSimple } from 'src/app/models/enum/TypeDeRechercheSimple.enum';
import { RechercheReseauForm } from 'src/app/models/RechercheReseau';

@Component({
  selector: 'app-reseau-recherche',
  templateUrl: './reseau-recherche.component.html',
  styleUrls: ['./reseau-recherche.component.css'],
})
export class ReseauRechercheComponent implements OnInit {
  @Output() rechercher = new EventEmitter<RechercheReseauForm>();

  TypeDeRechercheSimpleEnum = TypeDeRechercheSimple;
  TechnologyTypeEnum = TechnologyType;

  rechercheAvancee = false;

  form: FormGroup = this.formBuilder.group({
    typeDeRechercheSimple: [
      TypeDeRechercheSimple.producerMarketParticipantName,
    ],
    rechercheSimple: [''],
    valeursRecherchees: this.formBuilder.group({
      technologyType: [Object.keys(TechnologyType)],
      producerMarketParticipantName: [{ value: '', disabled: true }],
      siteName: [{ value: '', disabled: true }],
      substationName: [{ value: '', disabled: true }],
      substationMrid: [{ value: '', disabled: true }],
      producerMarketParticipantMrid: [{ value: '', disabled: true }],
    }),
  });

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {}

  onSubmit() {
    let formRecherche: RechercheReseauForm = {
      ...this.form.value.valeursRecherchees,
    };
    if (!this.rechercheAvancee) {
      // Recherche simple => on place la valeur recherchée dans le bon champ du formulaire
      (formRecherche as any)[this.form.value.typeDeRechercheSimple] =
        this.form.value.rechercheSimple;
    }
    this.rechercher.emit(formRecherche);
  }

  switchRechercheAvancee() {
    this.rechercheAvancee = !this.rechercheAvancee;

    // Recherche simple
    this.enableControl(
      this.form,
      'typeDeRechercheSimple',
      !this.rechercheAvancee
    );
    this.enableControl(this.form, 'rechercheSimple', !this.rechercheAvancee);

    // Recherche avancee
    const formGroupRecherche = this.form.get('valeursRecherchees');
    this.enableControl(
      formGroupRecherche,
      'producerMarketParticipantName',
      this.rechercheAvancee
    );
    this.enableControl(formGroupRecherche, 'siteName', this.rechercheAvancee);
    this.enableControl(
      formGroupRecherche,
      'substationName',
      this.rechercheAvancee
    );
    this.enableControl(
      formGroupRecherche,
      'substationMrid',
      this.rechercheAvancee
    );
    this.enableControl(
      formGroupRecherche,
      'producerMarketParticipantMrid',
      this.rechercheAvancee
    );
  }

  private enableControl(
    formGroup: AbstractControl | null,
    formControlName: string,
    enable: Boolean
  ) {
    if (formGroup != null) {
      if (enable) {
        formGroup.get(formControlName)?.enable();
      } else {
        formGroup.get(formControlName)?.disable();
      }
    }
  }
}
