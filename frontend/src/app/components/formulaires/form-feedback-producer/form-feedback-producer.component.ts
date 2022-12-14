import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {InstanceService} from "../../../services/api/instance.service";
import {Instance} from "../../../models/enum/Instance.enum";
import {MatStepper} from "@angular/material/stepper";
import {environment} from "../../../../environments/environment";
import {FeedbackProducerService} from "../../../services/api/feedback-producer.service";
import {FeedbackElements} from "../../../rules/feedback-elements";
import {FeedbackProducer} from "../../../models/FeedbackProducer";

export interface FormFeedbackProducerBottomSheetResponse {
  feedbackProducer: FeedbackProducer | null
};

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
  feedbackElements: string[] = [];

  InstanceEnum = Instance;
  tailleMaxMessageFeedbackProducer = environment.tailleMaxMessageFeedbackProducer;
  AllFeedbackElements = FeedbackElements;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public bottomSheetParams: {
      activationDocumentMrid: string,
      feedbackElements: string,
      feedback: string,
      feedbackAnswer: string,
    },
    private formBuilder: FormBuilder,
    private bottomsheet: MatBottomSheetRef<FormFeedbackProducerComponent, FormFeedbackProducerBottomSheetResponse>,
    private instanceService: InstanceService,
    private feedbackProducerService: FeedbackProducerService,
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

    this.feedbackElements = this.bottomSheetParams.feedbackElements == null ? [] : this.bottomSheetParams.feedbackElements.split("|");
  }

  toResume(stepperRef: MatStepper) {
    let message = this.form.get('message')?.value;
    message = message != null ? message.trim() : message;
    this.form.get('message')?.setValue(message);
    stepperRef.next();
  }

  onSubmit(stepperRef: MatStepper) {
    this.loading = true;
    const message = this.form.get('message')?.value;
    if (this.instance == Instance.PRODUCER) {
      // Producer give feedback
      const elements = this.form.get('elements')?.value.reduce((acc: string, val: string) => acc + "|" + val);
      this.feedbackProducerService.postFeedbackProducer(this.bottomSheetParams.activationDocumentMrid, message, elements).subscribe(
        (feedbackProducer) => {
          this.loading = false;
          this.bottomsheet.dismiss({feedbackProducer: feedbackProducer});
        },
        (error) => {
          this.loading = false;
        }
      );
    } else {
      // The answer
      this.feedbackProducerService.postFeedbackProducerAnswer(this.bottomSheetParams.activationDocumentMrid, message).subscribe(
        (feedbackProducer) => {
          this.loading = false;
          this.bottomsheet.dismiss({feedbackProducer: feedbackProducer});
        },
        (error) => {
          this.loading = false;
        }
      );
    }
  }

}
