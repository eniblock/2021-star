import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {OrdreLimitationService} from "../../../../services/api/ordre-limitation.service";
import {EnergyAmountService} from "../../../../services/api/energy-amount.service";
import {MatStepper} from "@angular/material/stepper";
import {DateHelper} from "../../../../helpers/date.helper";

@Component({
  selector: 'app-form-ene-eni-form',
  templateUrl: './form-ene-eni-form.component.html',
  styleUrls: ['./form-ene-eni-form.component.css']
})
export class FormEneEniFormComponent implements OnInit {
  form: FormGroup = this.formBuilder.group({
    activationDocumentMrid: ['', Validators.required],
    revisionNumber: ['', Validators.required],
    processType: ['A42', Validators.required],
    businessType: ['C55', Validators.required],
    classificationType: ['', Validators.required],
    quantity: ['', [Validators.required, Validators.pattern('[0-9]*')]],
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

  startDatetimeLimitation: Date = new Date();
  endDatetimeLimitation: Date = new Date();

  constructor(
    private formBuilder: FormBuilder,
    private energyAmountService: EnergyAmountService,
  ) {
  }

  ngOnInit(): void {
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
    /*
    const form = {
      ...this.form.value,
      endCreatedDateTime: this.endCreatedDateTime.toJSON().split('.')[0] + 'Z',
      messageType: this.form.value.messageType.code,
      businessType: this.form.value.businessType.code,
      reasonCode: this.form.value.reasonCode.code,
    };

    delete form.timestampDate;
    delete form.timestampTime;

    this.ordreLimitationService.creerOrdreFin(form).subscribe((ok) => {
      stepperRef.next(); // On passe sur le dernier step si ca s'est bien passé
    });
     */
  }

  reset(stepperRef: MatStepper) {
    stepperRef.reset();
  }

}
