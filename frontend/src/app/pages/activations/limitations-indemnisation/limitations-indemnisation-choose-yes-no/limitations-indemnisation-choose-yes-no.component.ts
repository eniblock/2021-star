import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {EligibilityStatus} from "../../../../models/enum/EligibilityStatus.enum";

export interface DialogDataEligibilityStatus {
  eligibilityStatus: EligibilityStatus | null;
}

@Component({
  selector: 'app-limitations-indemnisation-choose-yes-no',
  templateUrl: './limitations-indemnisation-choose-yes-no.component.html',
  styleUrls: ['./limitations-indemnisation-choose-yes-no.component.css']
})
export class LimitationsIndemnisationChooseYesNoComponent implements OnInit {

  EligibilityStatus = EligibilityStatus;

  constructor(
    public dialogRef: MatDialogRef<LimitationsIndemnisationChooseYesNoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDataEligibilityStatus,
  ) {
  }

  ngOnInit(): void {
  }

}
