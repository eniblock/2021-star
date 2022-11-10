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

  constructor(
    private instanceService: InstanceService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.instanceService.getTypeInstance().subscribe((instance) => {
      this.instance = instance;
    });
  }

  commentaireProducer() {
    console.log(this.activation);
  }

}
