import {Instance} from 'src/app/models/enum/Instance.enum';
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {TechnologyType} from 'src/app/models/enum/TechnologyType.enum';
import {
  getTypesDeRechercheSimple,
  TypeDeRechercheSimple,
} from 'src/app/models/enum/TypeDeRechercheSimple.enum';
import {FormulaireRechercheReseau} from 'src/app/models/RechercheReseau';
import {InstanceService} from 'src/app/services/api/instance.service';
import {ReseauService} from 'src/app/services/api/reseau.service';
import {ProducerService} from "../../../services/api/producer.service";
import {PosteSourceService} from "../../../services/api/poste-source.service";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";

@Component({
  selector: 'app-form-reseau-recherche',
  templateUrl: './form-reseau-recherche.component.html',
  styleUrls: ['./form-reseau-recherche.component.css'],
})
export class FormReseauRechercheComponent implements OnInit {
  @Output() formSubmit = new EventEmitter<FormulaireRechercheReseau>();

  typesDeRechercheSimple: TypeDeRechercheSimple[] = [];
  TechnologyTypeEnum = TechnologyType;
  InstanceEnum = Instance;

  producerNames: string[] = [];
  filteredProducerNames?: Observable<string[]>;

  posteSourceCodes: string[] = [];
  filteredPosteSourceCodes?: Observable<string[]>;

  rechercheAvancee = false;
  typeInstance?: Instance;

  form: FormGroup = this.formBuilder.group({
    typeDeRechercheSimple: [],
    champDeRechercheSimple: [''],
    valeursRecherchees: this.formBuilder.group({
      technologyType: [Object.keys(TechnologyType)],
      substationName: [''],
      substationMrid: [''],
      producerMarketParticipantName: [''],
      producerMarketParticipantMrid: [''],
      siteIecCode: [''],
      meteringpointmrId: [''],
    }),
  });

  constructor(
    private formBuilder: FormBuilder,
    private reseauService: ReseauService,
    private instanceService: InstanceService,
    private producerService: ProducerService,
    private posteSourceService: PosteSourceService,
  ) {
  }

  ngOnInit() {
    // En fonction du type d'instance, on affiche/masque des parties du formulaire
    this.instanceService.getTypeInstance().subscribe((typeInstance) => {
      this.typeInstance = typeInstance;
      this.typesDeRechercheSimple = getTypesDeRechercheSimple(typeInstance);
      this.form.patchValue({
        typeDeRechercheSimple: this.typesDeRechercheSimple[0],
      });
    });

    // On charge le formulaire en cache si y'en a un
    const formSauvegardeDansStorage: FormulaireRechercheReseau =
      this.reseauService.popFormulaireRecherche();
    if (formSauvegardeDansStorage != null) {
      this.rechercheAvancee =
        formSauvegardeDansStorage.typeDeRechercheSimple == undefined;
      this.form.patchValue(formSauvegardeDansStorage);
      this.enableDisableFields();
      this.onSubmit();
    }

    // Producer names
    this.producerService.getProducerNames().subscribe(
      producerNames => this.producerNames = producerNames
    )
    this.filteredProducerNames = this.form.get('valeursRecherchees')!.get('producerMarketParticipantName')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value, this.producerNames)),
    );

    // Poste source codes
    this.posteSourceService.getPosteSourceCodes().subscribe(
      posteSourceCodes => this.posteSourceCodes = posteSourceCodes
    )
    this.filteredPosteSourceCodes = this.form.get('valeursRecherchees')!.get('substationMrid')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value, this.posteSourceCodes)),
    );
  }

  onSubmit() {
    this.formSubmit.emit(this.form.value);
  }

  switchRechercheAvancee() {
    this.rechercheAvancee = !this.rechercheAvancee;
    this.form.get('champDeRechercheSimple')?.setValue('');
    this.enableDisableFields();
  }

  private enableDisableFields() {
    // On active/désactive les champs de recherche simple en fonction du type de recherche
    this.enableControl(
      this.form,
      ['typeDeRechercheSimple', 'champDeRechercheSimple'],
      !this.rechercheAvancee
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

  private filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(opt => opt.toLowerCase().includes(filterValue));
  }

}
