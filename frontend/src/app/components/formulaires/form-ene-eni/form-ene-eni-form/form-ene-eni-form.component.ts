import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {EnergyAmountService} from "../../../../services/api/energy-amount.service";
import {MatStepper} from "@angular/material/stepper";
import {DateHelper} from "../../../../helpers/date.helper";
import {RechercheHistoriqueLimitationEntite} from "../../../../models/RechercheHistoriqueLimitation";

const PROCESS_TYPE_INIT_VALUE = 'A42';
const BUSINESS_TYPE_INIT_VALUE = 'C55';

@Component({
  selector: 'app-form-ene-eni-form',
  templateUrl: './form-ene-eni-form.component.html',
  styleUrls: ['./form-ene-eni-form.component.css']
})
export class FormEneEniFormComponent implements OnInit {
  @Input() initialFormData?: RechercheHistoriqueLimitationEntite;

  form: FormGroup = this.formBuilder.group({
    activationDocumentMrid: ['', Validators.required],
    revisionNumber: ['', Validators.required],
    processType: [PROCESS_TYPE_INIT_VALUE, Validators.required],
    businessType: [BUSINESS_TYPE_INIT_VALUE, Validators.required],
    classificationType: ['', Validators.required],
    quantity: ['', [Validators.required, Validators.pattern('[0-9]*[\,\.]?[0-9]*')]],
    measurementUnitName: ['', Validators.required],
    timestampDateStart: ['', Validators.required],
    timestampTimeStart: [
      '',
      [
        Validators.required,
        Validators.pattern('[0-2]?[0-9]:[0-5]?[0-9]:[0-5]?[0-9]'),
      ],
    ],
    timestampDateEnd: ['', Validators.required],
    timestampTimeEnd: [
      '',
      [
        Validators.required,
        Validators.pattern('[0-2]?[0-9]:[0-5]?[0-9]:[0-5]?[0-9]'),
      ],
    ],
  });

  loading = false;

  startDatetimeLimitation: Date = new Date();
  endDatetimeLimitation: Date = new Date();

  constructor(
    private formBuilder: FormBuilder,
    private energyAmountService: EnergyAmountService,
  ) {
  }

  ngOnInit(): void {
    if (this.initialFormData != undefined) {
      const hasStartDate = this.initialFormData.activationDocument.startCreatedDateTime != null && this.initialFormData.activationDocument.startCreatedDateTime != "";
      const hasEndDate = this.initialFormData.activationDocument.endCreatedDateTime != null && this.initialFormData.activationDocument.endCreatedDateTime != "";
      this.form.get('activationDocumentMrid')?.setValue(this.initialFormData.activationDocument.activationDocumentMrid);
      this.form.get('revisionNumber')?.setValue("1");
      this.form.get('timestampDateStart')?.setValue(hasStartDate ? this.initialFormData.activationDocument.startCreatedDateTime : "");
      this.form.get('timestampTimeStart')?.setValue(hasStartDate ? DateHelper.utcDatetimeStrToLocalTimeStr(this.initialFormData.activationDocument.startCreatedDateTime) : "");
      this.form.get('timestampDateEnd')?.setValue(hasEndDate ? this.initialFormData.activationDocument.endCreatedDateTime : "");
      this.form.get('timestampTimeEnd')?.setValue(hasEndDate ? DateHelper.utcDatetimeStrToLocalTimeStr(this.initialFormData.activationDocument.endCreatedDateTime) : "");
    }
  }

  toResume(stepperRef: MatStepper) {
    this.startDatetimeLimitation = DateHelper.toDatetime(
      this.form.get('timestampDateStart')?.value,
      this.form.get('timestampTimeStart')?.value
    );
    this.endDatetimeLimitation = DateHelper.toDatetime(
      this.form.get('timestampDateEnd')?.value,
      this.form.get('timestampTimeEnd')?.value
    );
    stepperRef.next();
  }

  onSubmit(stepperRef: MatStepper) {
    this.loading = true;
    const startDatetime = this.startDatetimeLimitation.toJSON().split('.')[0] + 'Z';
    const endDatetime = this.endDatetimeLimitation.toJSON().split('.')[0] + 'Z';
    const form = {
      ...this.form.value,
      timeInterval: startDatetime + '/' + endDatetime,
    };

    delete form.timestampDateStart;
    delete form.timestampTimeStart;
    delete form.timestampDateEnd;
    delete form.timestampTimeEnd;

    this.energyAmountService.createWithForm(form).subscribe(
      (ok) => {
        this.loading = false;
        stepperRef.next(); // Next step if it's ok
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  reset(stepperRef: MatStepper) {
    stepperRef.reset();
    this.form.patchValue({
      processType: PROCESS_TYPE_INIT_VALUE,
      businessType: BUSINESS_TYPE_INIT_VALUE,
    });
  }

}
