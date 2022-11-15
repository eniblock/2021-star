import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-form-feedback-producer',
  templateUrl: './form-feedback-producer.component.html',
  styleUrls: ['./form-feedback-producer.component.css']
})
export class FormFeedbackProducerComponent implements OnInit {

  form: FormGroup = this.formBuilder.group({
    //energyPriceAmount: ['', [Validators.required, Validators.pattern('[0-9]*[\,\.]?[0-9]*')]],
    //validityPeriodStartDateTime: ['', Validators.required],
  });

  loading = false;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public bottomSheetParams: {
      activationDocumentMrid: string,
      feedbackElements: string,
      feedback: string,
      feedbackAnswer: string,
    },
    private formBuilder: FormBuilder,
    private bottomsheet: MatBottomSheetRef<FormFeedbackProducerComponent>,
  ) {
  }

  ngOnInit(): void {
    console.log(this.bottomSheetParams)
  }

  onSubmit() {
    this.loading = true;


    // modif ok
    this.loading = false;
    this.bottomsheet.dismiss("MON FEEDBACK MODIFIE");

    //TODO : PREVOIR SI l'appel du service est KO => loading = false
  }

}
