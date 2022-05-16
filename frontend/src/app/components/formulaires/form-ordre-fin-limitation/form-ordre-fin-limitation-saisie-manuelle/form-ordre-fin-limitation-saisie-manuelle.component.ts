import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { DateHelper } from 'src/app/helpers/date.helper';
import { MotifCode } from 'src/app/models/Motifs';
import {
  getAllBusinessTypesByMessageTypeCode,
  getAllReasonCodeByBusinessTypeCode,
  MessageTypes,
} from 'src/app/rules/motif-rules';
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

  selectMessageTypes: MotifCode[] = MessageTypes;
  selectBusinessTypes: MotifCode[] | null = null;
  selectReasonCodes: MotifCode[] | null = null;

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
      endCreatedDateTime: this.endCreatedDateTime.toJSON().split('.')[0] + 'Z',
      messageType: this.form.value.messageType.code,
      businessType: this.form.value.businessType.code,
      reasonCode: this.form.value.reasonCode.code,
    };

    delete form.timestampDate;
    delete form.timestampTime;

    this.ordreLimitationService.creerOrdreFin(form).subscribe((ok) => {
      stepperRef.next(); // Next step if it's ok
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
    this.selectBusinessTypes = getAllBusinessTypesByMessageTypeCode(
      this.form.value.messageType.code
    );
    this.form.get('businessType')?.setValue('');
    this.form.get('businessType')?.enable();

    this.selectReasonCodes = null;
    this.form.get('reasonCode')?.setValue('');
    this.form.get('reasonCode')?.disable();
  }

  selectionBusinessType() {
    this.selectReasonCodes = getAllReasonCodeByBusinessTypeCode(
      this.form.value.businessType.code
    );
    this.form.get('reasonCode')?.setValue('');
    this.form.get('reasonCode')?.enable();
  }
}
