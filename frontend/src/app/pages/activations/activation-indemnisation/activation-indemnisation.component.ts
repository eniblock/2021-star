import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EligibilityStatus} from "../../../models/enum/EligibilityStatus.enum";
import {MatDialog} from "@angular/material/dialog";
import {
  ActivationIndemnisationChooseYesNoComponent
} from "./activation-indemnisation-choose-yes-no/activation-indemnisation-choose-yes-no.component";

@Component({
  selector: 'app-activation-indemnisation',
  templateUrl: './activation-indemnisation.component.html',
  styleUrls: ['./activation-indemnisation.component.css']
})
export class ActivationIndemnisationComponent implements OnInit, OnChanges {

  @Input() eligibilityStatus: EligibilityStatus | null = null;
  @Input() eligibilityStatusEditable: boolean = false;

  public buttonClass = "";
  public loading = false;
  public marginIcons = "";

  constructor(
    public dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    switch (this.eligibilityStatus) {
      case EligibilityStatus.OUI:
        this.buttonClass = "bg-success text-white";
        break;
      case EligibilityStatus.NON:
        this.buttonClass = "bg-danger text-white";
        break;
      case null:
        this.buttonClass = "bg-primary text-white";
        break;
    }
    if (this.eligibilityStatus == EligibilityStatus.OUI || this.eligibilityStatus == EligibilityStatus.NON) {
      this.marginIcons = "ms-2";
    } else {
      this.marginIcons = "";
    }
  }

  click() {
    const dialogRef = this.dialog.open(ActivationIndemnisationChooseYesNoComponent, {
      width: '500px',
      data: {eligibilityStatus: this.eligibilityStatus},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    });
  }

}
