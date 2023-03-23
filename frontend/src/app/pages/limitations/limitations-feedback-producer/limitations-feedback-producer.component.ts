import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {RechercheHistoriqueLimitationEntite} from "../../../models/RechercheHistoriqueLimitation";
import {Instance} from "../../../models/enum/Instance.enum";
import {InstanceService} from "../../../services/api/instance.service";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {
  FormFeedbackProducerBottomSheetResponse,
  FormFeedbackProducerComponent
} from "../../../components/formulaires/form-feedback-producer/form-feedback-producer.component";
import {FeedbackProducer} from "../../../models/FeedbackProducer";
import {SystemOperatorService} from "../../../services/api/system-operator.service";
import {forkJoin} from "rxjs";
import {SystemOperator} from "../../../models/SystemOperator";

@Component({
  selector: 'app-limitations-feedback-producer',
  templateUrl: './limitations-feedback-producer.component.html',
  styleUrls: ['./limitations-feedback-producer.component.css']
})
export class LimitationsFeedbackProducerComponent implements OnChanges {
  @Input() historiqueLimitation?: RechercheHistoriqueLimitationEntite;
  @Output() feedbackChange = new EventEmitter<FeedbackProducer>();

  InstanceEnum = Instance;

  instance?: Instance;
  showButton = false;
  buttonCreationFeedbackDisabled = true;

  constructor(
    private instanceService: InstanceService,
    private systemOperatorService: SystemOperatorService,
    private bottomSheet: MatBottomSheet,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    forkJoin({
      instance: this.instanceService.getTypeInstance(),
      participantMrid: this.instanceService.getParticipantMrid(),
      marketParticipants: this.systemOperatorService.getSystemOperators()
    }).subscribe(
      res => {
        this.updateView(res.instance, res.participantMrid, res.marketParticipants);
      });
  }

  private updateView(instance: Instance, participantMrid: string, marketParticipants: SystemOperator[]) {
    this.instance = instance;

    let ordreEnvoyeAUnAutreSystemOperator =
      this.instance != Instance.PRODUCER
      && (
        (this.historiqueLimitation?.activationDocument.senderMarketParticipantMrid.toUpperCase() == participantMrid.toUpperCase() && marketParticipants.some(mp => mp.systemOperatorMarketParticipantMrid.toUpperCase() == this.historiqueLimitation?.activationDocument.receiverMarketParticipantMrid.toUpperCase()))
        ||
        (this.historiqueLimitation?.subOrderList && this.historiqueLimitation?.subOrderList.length > 0 && this.historiqueLimitation?.subOrderList![0].senderMarketParticipantMrid.toUpperCase() == participantMrid.toUpperCase() && marketParticipants.some(mp => mp.systemOperatorMarketParticipantMrid.toUpperCase() == this.historiqueLimitation?.subOrderList![0].receiverMarketParticipantMrid.toUpperCase()))
      );

    if (this.historiqueLimitation && this.historiqueLimitation.feedbackProducer) {
      const now = new Date();
      const dateFin = new Date(this.historiqueLimitation.feedbackProducer.validityPeriodEndDateTime);
      this.buttonCreationFeedbackDisabled = now.getTime() > dateFin.getTime();
      this.showButton =
        (
          this.historiqueLimitation.energyAmount?.quantity
          && this.historiqueLimitation.reserveBidMarketDocument?.energyPriceAmount
          && (this.historiqueLimitation.balancingDocument && this.historiqueLimitation.balancingDocument.financialPriceAmount != null)
          && !(!this.historiqueLimitation.feedbackProducer?.feedbackAnswer && ordreEnvoyeAUnAutreSystemOperator)
        ) as any;
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
        this.feedbackChange.emit(data.feedbackProducer);
      }
    });
  }
}
