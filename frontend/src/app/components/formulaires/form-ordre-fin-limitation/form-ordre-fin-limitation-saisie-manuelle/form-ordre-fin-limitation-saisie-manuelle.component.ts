import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-form-ordre-fin-limitation-saisie-manuelle',
  templateUrl: './form-ordre-fin-limitation-saisie-manuelle.component.html',
  styleUrls: ['./form-ordre-fin-limitation-saisie-manuelle.component.css'],
})
export class FormOrdreFinLimitationSaisieManuelleComponent implements OnInit {
  form: FormGroup = this.formBuilder.group({
    test: ['', Validators.required],
  });

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {}

  onSubmit(stepperRef: MatStepper) {
    console.log(this.form);

    stepperRef.next(); // On passe sur le dernier step si ca s'est bien passé
  }

  reset(stepperRef: MatStepper) {
    stepperRef.reset();
  }
}
