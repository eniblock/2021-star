import {Component, Inject, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {FormBuilder, FormGroup} from "@angular/forms";
import {InstanceService} from "../../../services/api/instance.service";
import {Instance} from "../../../models/enum/Instance.enum";
import {MatStepper} from "@angular/material/stepper";
import {DateHelper} from "../../../helpers/date.helper";

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

  afficherFormulaire = false;
  instance?: Instance;
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
    private instanceService: InstanceService,
  ) {
  }

  ngOnInit(): void {
    this.instanceService.getTypeInstance().subscribe(instance => {
      this.instance = instance;
      this.init();
    });
  }

  init() {
    this.afficherFormulaire =
      this.instance == Instance.PRODUCER && !this.bottomSheetParams.feedback
      ||
      this.instance != Instance.PRODUCER && !!this.bottomSheetParams.feedback && !this.bottomSheetParams.feedbackAnswer;
  }

  onSubmit(stepperRef: MatStepper) {
    this.loading = true;


    // modif ok
    this.loading = false;
    this.bottomsheet.dismiss("MON FEEDBACK MODIFIE");

    //TODO : PREVOIR SI l'appel du service est KO => loading = false
  }

}
