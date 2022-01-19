import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
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
    champDeRechercheSimple: [''],
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
        this.form.value.champDeRechercheSimple;
    }
    this.rechercher.emit(formRecherche);
  }

  switchRechercheAvancee() {
    this.rechercheAvancee = !this.rechercheAvancee;
    this.form.get('champDeRechercheSimple')?.setValue('');

    // Recherche simple
    this.enableControl(
      this.form,
      ['typeDeRechercheSimple', 'champDeRechercheSimple'],
      !this.rechercheAvancee
    );

    // Recherche avancee
    const formGroupRecherche = this.form.get('valeursRecherchees');
    this.enableControl(
      formGroupRecherche,
      [
        'producerMarketParticipantName',
        'siteName',
        'substationName',
        'substationMrid',
        'producerMarketParticipantMrid',
      ],
      this.rechercheAvancee
    );
  }

  private enableControl(
    formGroup: AbstractControl | null,
    formControlNames: string[],
    enable: Boolean
  ) {
    if (formGroup != null) {
      formControlNames.forEach((fcn) => {
        if (enable) {
          formGroup.get(fcn)?.enable();
        } else {
          formGroup.get(fcn)?.disable();
        }
      });
    }
  }
}
