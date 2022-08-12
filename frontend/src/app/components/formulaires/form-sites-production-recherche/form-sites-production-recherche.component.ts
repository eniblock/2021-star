import {Instance} from 'src/app/models/enum/Instance.enum';
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {TechnologyType} from 'src/app/models/enum/TechnologyType.enum';
import {
  getTypesDeRechercheSimple,
  TypeDeRechercheSimple,
} from 'src/app/models/enum/TypeDeRechercheSimple.enum';
import {FormulaireRechercheSitesProduction} from 'src/app/models/RechercheSitesProduction';
import {InstanceService} from 'src/app/services/api/instance.service';
import {SitesProductionService} from 'src/app/services/api/sites-production.service';
import {ProducerService} from "../../../services/api/producer.service";
import {SiteService} from "../../../services/api/site.service";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";
import {SortHelper} from "../../../helpers/sort.helper";

@Component({
  selector: 'app-form-sites-production-recherche',
  templateUrl: './form-sites-production-recherche.component.html',
  styleUrls: ['./form-sites-production-recherche.component.css'],
})
export class FormSitesProductionRechercheComponent implements OnInit {
  @Output() formSubmit = new EventEmitter<FormulaireRechercheSitesProduction>();

  typesDeRechercheSimple: TypeDeRechercheSimple[] = [];
  TechnologyTypeEnum = TechnologyType;
  InstanceEnum = Instance;

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
      meteringPointMrId: [''],
    }),
  });

  optionsProducerNames: string[] = [];
  filteredProducerNames?: Observable<string[]>;
  optionsSubstationNames: string[] = [];
  filteredSubstationNames?: Observable<string[]>;
  optionsSubstationMrids: string[] = [];
  filteredSubstationMrids?: Observable<string[]>;
  optionsProducerMarketParticipantMrids: string[] = [];
  filteredProducerMarketParticipantMrids?: Observable<string[]>;
  optionsSiteIecCodes: string[] = [];
  filteredSiteIecCodes?: Observable<string[]>;
  optionsMeteringPointMrIds: string[] = [];
  filteredMeteringPointMrIds?: Observable<string[]>;

  optionsSiteNames: string[] = [];
  filteredRechercheSimple?: Observable<string[]>;

  constructor(
    private formBuilder: FormBuilder,
    private sitesProductionService: SitesProductionService,
    private instanceService: InstanceService,
    private producerService: ProducerService,
    private siteService: SiteService,
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
    const formSauvegardeDansStorage: FormulaireRechercheSitesProduction =
      this.sitesProductionService.popFormulaireRecherche();
    if (formSauvegardeDansStorage != null) {
      this.rechercheAvancee =
        formSauvegardeDansStorage.typeDeRechercheSimple == undefined;
      this.form.patchValue(formSauvegardeDansStorage);
      this.enableDisableFields();
      this.onSubmit();
    }

    this.loadMenusDeroulants();
  }

  onSubmit() {
    this.formSubmit.emit(this.form.value);
  }

  switchRechercheAvancee() {
    this.rechercheAvancee = !this.rechercheAvancee;
    this.cleanForm();
    this.enableDisableFields();
  }

  private cleanForm() {
    this.form.get('champDeRechercheSimple')!.setValue('');
    this.form.get('valeursRecherchees')!.get('substationName')!.setValue('');
    this.form.get('valeursRecherchees')!.get('substationMrid')!.setValue('');
    this.form.get('valeursRecherchees')!.get('producerMarketParticipantName')!.setValue('');
    this.form.get('valeursRecherchees')!.get('producerMarketParticipantMrid')!.setValue('');
    this.form.get('valeursRecherchees')!.get('siteIecCode')!.setValue('');
    this.form.get('valeursRecherchees')!.get('meteringPointMrId')!.setValue('');
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

  private loadMenusDeroulants() {
    // Producer names
    this.producerService.getProducerNames().subscribe(
      producerNames => {
        this.optionsProducerNames = producerNames;
        this.filteredProducerNames = this.form.get('valeursRecherchees')!.get('producerMarketParticipantName')!.valueChanges.pipe(
          startWith(''),
          map(value => this.filter(value, this.optionsProducerNames)),
        );
      }
    )

    // Sites
    this.siteService.getSites().subscribe(
      sites => {
        // substationName
        this.optionsSubstationNames = sites.map(s => s.substationName).filter((item, pos, self) => self.indexOf(item) == pos).sort(SortHelper.caseInsensitive);
        this.filteredSubstationNames = this.form.get('valeursRecherchees')!.get('substationName')!.valueChanges.pipe(
          startWith(''),
          map(value => this.filter(value, this.optionsSubstationNames)),
        );
        // substationMrid
        this.optionsSubstationMrids = sites.map(s => s.substationMrid).filter((item, pos, self) => self.indexOf(item) == pos).sort(SortHelper.caseInsensitive);
        this.filteredSubstationMrids = this.form.get('valeursRecherchees')!.get('substationMrid')!.valueChanges.pipe(
          startWith(''),
          map(value => this.filter(value, this.optionsSubstationMrids)),
        );
        // producerMarketParticipantMrid
        this.optionsProducerMarketParticipantMrids = sites.map(s => s.producerMarketParticipantMrid).filter((item, pos, self) => self.indexOf(item) == pos).sort(SortHelper.caseInsensitive);
        this.filteredProducerMarketParticipantMrids = this.form.get('valeursRecherchees')!.get('producerMarketParticipantMrid')!.valueChanges.pipe(
          startWith(''),
          map(value => this.filter(value, this.optionsProducerMarketParticipantMrids)),
        );
        // siteIecCode
        this.optionsSiteIecCodes = (sites.map(s => s.siteIecCode).filter(iec => iec != undefined) as string[])
          .filter((item, pos, self) => self.indexOf(item) == pos)
          .sort(SortHelper.caseInsensitive) as string[];
        this.filteredSiteIecCodes = this.form.get('valeursRecherchees')!.get('siteIecCode')!.valueChanges.pipe(
          startWith(''),
          map(value => this.filter(value, this.optionsSiteIecCodes)),
        );
        // meteringPointMrId
        this.optionsMeteringPointMrIds = sites.map(s => s.meteringPointMrid).filter(iec => iec != undefined).filter((item, pos, self) => self.indexOf(item) == pos).sort(SortHelper.caseInsensitive) as string[];
        this.filteredMeteringPointMrIds = this.form.get('valeursRecherchees')!.get('meteringPointMrId')!.valueChanges.pipe(
          startWith(''),
          map(value => this.filter(value, this.optionsMeteringPointMrIds)),
        );
        // siteNames
        this.optionsSiteNames = sites.map(s => s.siteName).filter(iec => iec != undefined).filter((item, pos, self) => self.indexOf(item) == pos).sort(SortHelper.caseInsensitive) as string[];
        // recherche simpte
        this.initRechercheSimple();
      }
    )
  }

  private initRechercheSimple() {
    if (this.form.get('typeDeRechercheSimple')!.value) {
      this.filteredRechercheSimple = this.form.get('champDeRechercheSimple')!.valueChanges.pipe(
        startWith(''),
        map(value => {
          switch (this.form.get('typeDeRechercheSimple')!.value as TypeDeRechercheSimple) {
            case TypeDeRechercheSimple.siteName:
              return this.filter(value, this.optionsSiteNames)
            case TypeDeRechercheSimple.substationName:
              return this.filter(value, this.optionsSubstationNames)
            case TypeDeRechercheSimple.producerMarketParticipantName:
              return this.filter(value, this.optionsProducerNames)
          }
        }),
      );
    }
  }

  public typeRechercheSimpleChange() {
    this.initRechercheSimple();
  }

  private filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(opt => opt.toLowerCase().includes(filterValue));
  }

}
