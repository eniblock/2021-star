import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {RechercheHistoriqueLimitationEntite} from "../../../models/RechercheHistoriqueLimitation";
import {Instance} from "../../../models/enum/Instance.enum";
import {InstanceService} from "../../../services/api/instance.service";

@Component({
  selector: 'app-limitations-feedback-producer',
  templateUrl: './limitations-feedback-producer.component.html',
  styleUrls: ['./limitations-feedback-producer.component.css']
})
export class LimitationsFeedbackProducerComponent implements OnChanges {
  @Input() activation?: RechercheHistoriqueLimitationEntite;

  InstanceEnum = Instance;

  instance?: Instance;
  buttonCreationFeedbackDisabled = true;

  constructor(
    private instanceService: InstanceService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.instanceService.getTypeInstance().subscribe((instance) => {
      this.instance = instance;
    });

    if (this.activation) {
      const now = new Date();
      const dateFin = new Date(this.activation.feedbackProducer.validityPeriodEndDateTime);
      this.buttonCreationFeedbackDisabled = now.getTime() > dateFin.getTime();
    } else {
      this.buttonCreationFeedbackDisabled = true;
    }
  }

  commentaireProducer() {
    console.log(this.activation);
  }

}
