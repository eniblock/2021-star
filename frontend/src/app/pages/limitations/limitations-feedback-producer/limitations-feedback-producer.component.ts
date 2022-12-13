import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {RechercheHistoriqueLimitationEntite} from "../../../models/RechercheHistoriqueLimitation";
import {Instance} from "../../../models/enum/Instance.enum";
import {InstanceService} from "../../../services/api/instance.service";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {
  FormFeedbackProducerBottomSheetResponse,
  FormFeedbackProducerComponent
} from "../../../components/formulaires/form-feedback-producer/form-feedback-producer.component";

@Component({
  selector: 'app-limitations-feedback-producer',
  templateUrl: './limitations-feedback-producer.component.html',
  styleUrls: ['./limitations-feedback-producer.component.css']
})
export class LimitationsFeedbackProducerComponent implements OnChanges {
  @Input() historiqueLimitation?: RechercheHistoriqueLimitationEntite;

  InstanceEnum = Instance;

  instance?: Instance;
  showButton = false;
  buttonCreationFeedbackDisabled = true;

  constructor(
    private instanceService: InstanceService,
    private bottomSheet: MatBottomSheet,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.instanceService.getTypeInstance().subscribe((instance) => {
      this.instance = instance;
    });

    if (this.historiqueLimitation && this.historiqueLimitation.feedbackProducer) {
      const now = new Date();
      const dateFin = new Date(this.historiqueLimitation.feedbackProducer.validityPeriodEndDateTime);
      this.buttonCreationFeedbackDisabled = now.getTime() > dateFin.getTime();
      this.showButton = (this.historiqueLimitation.energyAmount?.quantity && this.historiqueLimitation.reserveBidMarketDocument?.energyPriceAmount && (this.historiqueLimitation.balancingDocument && this.historiqueLimitation.balancingDocument!.financialPriceAmount != null)) as any;
    } else {
      this.buttonCreationFeedbackDisabled = true;
      this.showButton = false;
    }
  }

  commentaire() {
    const bottomSheetRef = this.bottomSheet.open(FormFeedbackProducerComponent, {
      data: {
        activationDocumentMrid: this.historiqueLimitation?.activationDocument.activationDocumentMrid,
        feedbackElements: this.historiqueLimitation?.feedbackProducer.feedbackElements,
        feedback: this.historiqueLimitation?.feedbackProducer.feedback,
        feedbackAnswer: this.historiqueLimitation?.feedbackProducer.feedbackAnswer,
      }
    });
    bottomSheetRef.afterDismissed().subscribe((data: FormFeedbackProducerBottomSheetResponse) => {
      if (data && data.feedbackProducer) {
        if (data.feedbackProducer.feedback) {
          this.historiqueLimitation!.feedbackProducer.feedback = data.feedbackProducer.feedback;
        }
        if (data.feedbackProducer.feedbackElements) {
          this.historiqueLimitation!.feedbackProducer.feedbackElements = data.feedbackProducer.feedbackElements;
        }
        if (data.feedbackProducer.feedbackAnswer) {
          this.historiqueLimitation!.feedbackProducer.feedbackAnswer = data.feedbackProducer.feedbackAnswer;
        }
      }
    });
  }

}
