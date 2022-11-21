import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {InstanceService} from "../../../services/api/instance.service";
import {Instance} from "../../../models/enum/Instance.enum";
import {MatStepper} from "@angular/material/stepper";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-form-feedback-producer',
  templateUrl: './form-feedback-producer.component.html',
  styleUrls: ['./form-feedback-producer.component.css']
})
export class FormFeedbackProducerComponent implements OnInit {

  form: FormGroup = this.formBuilder.group({
    elements: ['', Validators.required],
    message: ['', [Validators.required, Validators.maxLength(environment.tailleMaxMessageFeedbackProducer)]],
  });

  afficherFormulaire = false;
  instance?: Instance;
  loading = false;

  InstanceEnum = Instance;
  tailleMaxMessageFeedbackProducer = environment.tailleMaxMessageFeedbackProducer;

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
      this.initComponent();
    });
  }

  initComponent() {
    this.afficherFormulaire =
      this.instance == Instance.PRODUCER && !this.bottomSheetParams.feedback
      ||
      this.instance != Instance.PRODUCER && !!this.bottomSheetParams.feedback && !this.bottomSheetParams.feedbackAnswer;

    if (this.instance != Instance.PRODUCER) {
      this.form.get("elements")?.removeValidators(Validators.required);
    }
  }

  onSubmit(stepperRef: MatStepper) {
    this.loading = true;


    // modif ok
    this.loading = false;
    this.bottomsheet.dismiss("MON FEEDBACK MODIFIE");

    //TODO : PREVOIR SI l'appel du service est KO => loading = false
  }

}
