import { Instance } from 'src/app/models/enum/Instance.enum';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { InstanceService } from 'src/app/services/api/instance.service';
import { FormulaireRechercheActivations } from 'src/app/models/RechercheActivations';
import { ActivationsService } from 'src/app/services/api/activations.service';
import { DateHelper } from 'src/app/helpers/date.helper';

@Component({
  selector: 'app-form-activations-recherche',
  templateUrl: './form-activations-recherche.component.html',
  styleUrls: ['./form-activations-recherche.component.css'],
})
export class FormActivationsRechercheComponent implements OnInit {
  @Output() formSubmit = new EventEmitter<FormulaireRechercheActivations>();

  InstanceEnum = Instance;
  typeInstance?: Instance;

  form: FormGroup = this.formBuilder.group({
    originAutomationRegisteredResourceMrid: [''],
    producerMarketParticipantMrid: [''],
    siteName: [''],
    startCreatedDateTime: [''],
    endCreatedDateTime: [''],
  });

  constructor(
    private formBuilder: FormBuilder,
    private activationsService: ActivationsService,
    private instanceService: InstanceService
  ) {}

  ngOnInit() {
    this.instanceService.getTypeInstance().subscribe((typeInstance) => {
      this.typeInstance = typeInstance;
    });

    // On charge le formulaire en cache si y'en a un
    const formSauvegardeDansStorage: FormulaireRechercheActivations =
      this.activationsService.popFormulaireRecherche();
    if (formSauvegardeDansStorage != null) {
      this.form.patchValue(formSauvegardeDansStorage);
      this.onSubmit();
    }
  }

  onSubmit() {
    const f = this.form.value;
    const form: FormulaireRechercheActivations = {
      ...f,
      startCreatedDateTime: !f.startCreatedDateTime
        ? null
        : f.startCreatedDateTime.toJSON(),
      endCreatedDateTime: !f.endCreatedDateTime
        ? null
        : f.endCreatedDateTime.toJSON(),
    };
    this.formSubmit.emit(form);
  }
}
