import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EligibilityStatus} from "../../../models/enum/EligibilityStatus.enum";
import {MatDialog} from "@angular/material/dialog";
import {
  LimitationsIndemnisationChooseYesNoComponent
} from "./limitations-indemnisation-choose-yes-no/limitations-indemnisation-choose-yes-no.component";
import {OrdreLimitationService} from "../../../services/api/ordre-limitation.service";

@Component({
  selector: 'app-limitations-indemnisation',
  templateUrl: './limitations-indemnisation.component.html',
  styleUrls: ['./limitations-indemnisation.component.css']
})
export class LimitationsIndemnisationComponent implements OnInit, OnChanges {

  @Input() eligibilityStatus: EligibilityStatus | null = null;
  @Input() eligibilityStatusEditable: boolean = false;
  @Input() activationDocumentMrid: string = "";

  public buttonClass = "";
  public buttonDisabledClass = "";
  public loading = false;
  public marginIcons = "";

  constructor(
    public dialog: MatDialog,
    private ordreLimitationService: OrdreLimitationService,
  ) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateButtonClasses();
  }

  updateButtonClasses() {
    switch (this.eligibilityStatus) {
      case EligibilityStatus.OUI:
        this.buttonClass = "bg-success text-white";
        this.buttonDisabledClass = "text-success";
        break;
      case EligibilityStatus.NON:
        this.buttonClass = "bg-danger text-white";
        this.buttonDisabledClass = "text-danger";
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
    const activationDocumentMrid = this.activationDocumentMrid;
    const dialogRef = this.dialog.open(LimitationsIndemnisationChooseYesNoComponent, {
      width: '500px',
      data: {eligibilityStatus: this.eligibilityStatus},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        this.loading = true;
        this.ordreLimitationService.updateEligibilityStatus(activationDocumentMrid, result).subscribe(
          (result) => {
            this.loading = false;
            this.eligibilityStatus = result.eligibilityStatus ? result.eligibilityStatus!.toUpperCase() as any : null;
            this.eligibilityStatusEditable = result.eligibilityStatusEditable;
            this.updateButtonClasses();
          },
          (error) => {
            this.loading = false;
          }
        );
      }
    });
  }

}
