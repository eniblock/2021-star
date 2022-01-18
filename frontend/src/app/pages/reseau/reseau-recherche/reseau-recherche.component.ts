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
    technologyType: [Object.keys(TechnologyType)],
    rechercheSimple: [''],

    producerMarketParticipantName: [{ value: '', disabled: true }],
    siteName: [{ value: '', disabled: true }],
    substationName: [{ value: '', disabled: true }],
    substationMrid: [{ value: '', disabled: true }],
    producerMarketParticipantMrid: [{ value: '', disabled: true }],
  });

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {}

  onSubmit() {
    let formRecherche: RechercheReseauForm = { ...this.form.value };
    if (!this.rechercheAvancee) {
      // Recherche simple
      (formRecherche as any)[this.form.value.typeDeRechercheSimple] =
        this.form.value.rechercheSimple;
    }
    this.rechercher.emit(formRecherche);
  }

  switchRechercheAvancee() {
    this.rechercheAvancee = !this.rechercheAvancee;

    // Recherche simple
    this.enableControl('typeDeRechercheSimple', !this.rechercheAvancee);
    this.enableControl('rechercheSimple', !this.rechercheAvancee);

    // Recherche avancee
    this.enableControl('producerMarketParticipantName', this.rechercheAvancee);
    this.enableControl('siteName', this.rechercheAvancee);
    this.enableControl('substationName', this.rechercheAvancee);
    this.enableControl('substationMrid', this.rechercheAvancee);
    this.enableControl('producerMarketParticipantMrid', this.rechercheAvancee);
  }

  private enableControl(formControlName: string, enable: Boolean) {
    if (enable) {
      this.form.get(formControlName)?.enable();
    } else {
      this.form.get(formControlName)?.disable();
    }
  }
}
