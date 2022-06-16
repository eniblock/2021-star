import {Instance} from 'src/app/models/enum/Instance.enum';
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {InstanceService} from 'src/app/services/api/instance.service';
import {FormulaireRechercheHistoriqueLimitation} from 'src/app/models/RechercheHistoriqueLimitation';
import {HistoriqueLimitationService} from 'src/app/services/api/historique-limitation.service';
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";
import {ProducerService} from "../../../services/api/producer.service";
import {SiteService} from "../../../services/api/site.service";
import {SortHelper} from "../../../helpers/sort.helper";

@Component({
  selector: 'app-form-activations-recherche',
  templateUrl: './form-activations-recherche.component.html',
  styleUrls: ['./form-activations-recherche.component.css'],
})
export class FormActivationsRechercheComponent implements OnInit {
  @Output() formSubmit =
    new EventEmitter<FormulaireRechercheHistoriqueLimitation>();

  InstanceEnum = Instance;
  typeInstance?: Instance;

  form: FormGroup = this.formBuilder.group({
    originAutomationRegisteredResourceMrid: [''],
    producerMarketParticipantName: [''],
    siteName: [''],
    startCreatedDateTime: [''],
    endCreatedDateTime: [''],
  });

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

}
