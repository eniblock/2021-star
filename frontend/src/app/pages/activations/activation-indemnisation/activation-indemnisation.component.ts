import {Component, Input, OnInit} from '@angular/core';
import {OrdreLimitation} from "../../../models/OrdreLimitation";
import {EligibilityStatus} from "../../../models/enum/EligibilityStatus.enum";

@Component({
  selector: 'app-activation-indemnisation',
  templateUrl: './activation-indemnisation.component.html',
  styleUrls: ['./activation-indemnisation.component.css']
})
export class ActivationIndemnisationComponent implements OnInit {

  public EligibilityStatus = EligibilityStatus

  @Input() ordreLimitation!: OrdreLimitation;

  constructor() {
  }

  ngOnInit(): void {
  }

}
