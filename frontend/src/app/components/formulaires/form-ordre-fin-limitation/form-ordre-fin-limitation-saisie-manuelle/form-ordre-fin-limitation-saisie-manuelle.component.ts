import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { DateHelper } from 'src/app/helpers/date.helper';
import {
  CodeLabel,
  getMessagesTypes,
  getBusinessTypes,
  getReasonCodes,
} from 'src/app/models/Motifs';
import { OrdreLimitationService } from 'src/app/services/api/ordre-limitation.service';

@Component({
  selector: 'app-form-ordre-fin-limitation-saisie-manuelle',
  templateUrl: './form-ordre-fin-limitation-saisie-manuelle.component.html',
  styleUrls: ['./form-ordre-fin-limitation-saisie-manuelle.component.css'],
})
export class FormOrdreFinLimitationSaisieManuelleComponent implements OnInit {
  form: FormGroup = this.formBuilder.group({
    originAutomationRegisteredResourceMrid: ['', Validators.required],
    registeredResourceMrid: ['', Validators.required],
    senderMarketParticipantMrid: ['', Validators.required],
    receiverMarketParticipantMrid: ['', Validators.required],
    orderValue: ['', [Validators.required, Validators.pattern('[0-9]+')]],
    measurementUnitName: ['', Validators.required],
    timestampDate: ['', Validators.required],
    timestampTime: [
      '',
      [
        Validators.required,
        Validators.pattern('[0-2]?[0-9]:[0-5]?[0-9]:[0-5]?[0-9]'),
      ],
    ],
    messageType: ['', Validators.required],
    businessType: [{ value: '', disabled: true }, Validators.required],
    reasonCode: [{ value: '', disabled: true }, Validators.required],
  });

  endCreatedDateTime: Date = new Date();

  selectMessageTypes: CodeLabel[] = getMessagesTypes();
  selectBusinessTypes: CodeLabel[] | null = null;
  selectReasonCodes: CodeLabel[] | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private ordreLimitationService: OrdreLimitationService
  ) {}

  ngOnInit() {}

  toResume(stepperRef: MatStepper) {
    this.endCreatedDateTime = DateHelper.toDatetime(
      this.form.get('timestampDate')?.value,
      this.form.get('timestampTime')?.value
    );
    stepperRef.next();
  }

  onSubmit(stepperRef: MatStepper) {
    const form = {
      ...this.form.value,
      endCreatedDateTime: this.endCreatedDateTime,
    };

    delete form.timestampDate;
    delete form.timestampTime;

    this.ordreLimitationService.creerOrdreFin(form).subscribe((ok) => {
      stepperRef.next(); // On passe sur le dernier step si ca s'est bien passé
    });
  }

  reset(stepperRef: MatStepper) {
    stepperRef.reset();

    /*
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.form.updateValueAndValidity();

    this.form.get('test')?.markAsPristine();
    this.form.get('test')?.markAsUntouched();

    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.controls[key];
      control.markAsPristine();
      control.markAsUntouched();
    });
    */
  }

  selectionMessageType() {
    this.selectBusinessTypes = getBusinessTypes(this.form.value.messageType);
    this.form.get('businessType')?.setValue('');
    if (
      this.selectBusinessTypes != null &&
      this.selectBusinessTypes.length > 0
    ) {
      this.form.get('businessType')?.enable();
    } else {
      this.form.get('businessType')?.disable();
    }
    this.selectReasonCodes = null;
    this.form.get('reasonCode')?.setValue('');
    this.form.get('reasonCode')?.disable();
  }

  selectionBusinessType() {
    this.selectReasonCodes = getReasonCodes(this.form.value.businessType);
    this.form.get('reasonCode')?.setValue('');
    this.form.get('reasonCode')?.enable();
  }
}
