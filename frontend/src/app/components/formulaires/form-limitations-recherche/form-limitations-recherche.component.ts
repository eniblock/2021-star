import {Instance} from 'src/app/models/enum/Instance.enum';
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {InstanceService} from 'src/app/services/api/instance.service';
import {FormulaireRechercheHistoriqueLimitation} from 'src/app/models/RechercheHistoriqueLimitation';
import {HistoriqueLimitationService} from 'src/app/services/api/historique-limitation.service';
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";
import {ProducerService} from "../../../services/api/producer.service";
import {SiteService} from "../../../services/api/site.service";
import {SortHelper} from "../../../helpers/sort.helper";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-form-limitations-recherche',
  templateUrl: './form-limitations-recherche.component.html',
  styleUrls: ['./form-limitations-recherche.component.css'],
})
export class FormLimitationsRechercheComponent implements OnInit {
  @Output() formSubmit =
    new EventEmitter<FormulaireRechercheHistoriqueLimitation>();

  InstanceEnum = Instance;
  typeInstance?: Instance;

  form: FormGroup = this.formBuilder.group({
      originAutomationRegisteredResourceMrid: [''],
      producerMarketParticipantName: [''],
      siteName: [''],
      meteringPointMrid: [''],
      motif: [''],
      typeLimitation: [''],
      startCreatedDateTime: [''],
      endCreatedDateTime: [''],
    },
    {validator: this.validateDates}
  )

  intervalDateMaxRechercheHistoriqueLimitation = environment.intervalDateMaxRechercheHistoriqueLimitation;

  optionsProducerNames: string[] = [];
  filteredProducerNames?: Observable<string[]>;
  optionsPosteSourceCodes: string[] = [];
  filteredPosteSourceCodes?: Observable<string[]>;

  constructor(
    private formBuilder: FormBuilder,
    private historiqueLimitationService: HistoriqueLimitationService,
    private instanceService: InstanceService,
    private producerService: ProducerService,
    private siteService: SiteService,
  ) {
  }

  ngOnInit() {
    this.instanceService.getTypeInstance().subscribe((typeInstance) => {
      this.typeInstance = typeInstance;
    });

    // On charge le formulaire en cache si y'en a un
    const formSauvegardeDansStorage: FormulaireRechercheHistoriqueLimitation =
      this.historiqueLimitationService.popFormulaireRecherche();
    if (formSauvegardeDansStorage != null) {
      this.form.patchValue(formSauvegardeDansStorage);
      if (this.form.value.startCreatedDateTime) {
        this.form
          .get('startCreatedDateTime')
          ?.setValue(new Date(this.form.value.startCreatedDateTime));
      }
      if (this.form.value.endCreatedDateTime) {
        this.form
          .get('endCreatedDateTime')
          ?.setValue(new Date(this.form.value.endCreatedDateTime));
      }
      this.onSubmit();
    }

    // Producer names
    this.producerService.getProducerNames().subscribe(
      producerNames => {
        this.optionsProducerNames = producerNames;
        this.filteredProducerNames = this.form.get('producerMarketParticipantName')!.valueChanges.pipe(
          startWith(''),
          map(value => this.filter(value, this.optionsProducerNames)),
        );
      }
    )

    // Poste source codes
    this.siteService.getSites().subscribe(
      sites => {
        this.optionsPosteSourceCodes = sites.map(s => s.substationMrid).filter((item, pos, self) => self.indexOf(item) == pos).sort(SortHelper.caseInsensitive);
        this.filteredPosteSourceCodes = this.form.get('originAutomationRegisteredResourceMrid')!.valueChanges.pipe(
          startWith(''),
          map(value => this.filter(value, this.optionsPosteSourceCodes)),
        );
      }
    )
  }

  onSubmit() {
    const f = this.form.value;
    const form: FormulaireRechercheHistoriqueLimitation = {
      ...f,
      startCreatedDateTime: !f.startCreatedDateTime
        ? null
        : f.startCreatedDateTime.toJSON().split('.')[0] + 'Z',
      endCreatedDateTime: !f.endCreatedDateTime
        ? null
        : f.endCreatedDateTime.toJSON().split('.')[0] + 'Z',
    };
    this.formSubmit.emit(form);
  }

  private filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(opt => opt.toLowerCase().includes(filterValue));
  }

  private validateDates(control: AbstractControl): ValidationErrors | null {
    const startCreatedDateTime = control.get("startCreatedDateTime")!.value;
    const endCreatedDateTime = control.get("endCreatedDateTime")!.value;
    if (!startCreatedDateTime || !endCreatedDateTime) {
      return null;
    }

    const interval = new Date(endCreatedDateTime).getTime() - new Date(startCreatedDateTime).getTime();
    if (interval < 0) {
      return {ERROR_FORM_DATE_INTERVAL_NEGATIVE: true}
    } else if (interval > environment.intervalDateMaxRechercheHistoriqueLimitation * 24 * 3600 * 1000) {
      // return {ERROR_FORM_DATE_INTERVAL_TOO_LARGE: true}
    }
    return null;
  }

}
