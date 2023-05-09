import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {IndeminityStatus} from "../../../models/enum/IndeminityStatus.enum";
import {InstanceService} from "../../../services/api/instance.service";
import {Instance} from "../../../models/enum/Instance.enum";
import {MatDialog} from "@angular/material/dialog";
import {
  LimitationIndeminityStatusChangeComponent
} from "./limitation-indeminity-status-change/limitation-indeminity-status-change.component";
import {canChangeIndeminityStatus, showAbandonButton} from "../../../rules/indeminity-status-rules";
import {IndeminityStatusService} from "../../../services/api/indeminity-status.service";
import {RechercheHistoriqueLimitationEntite} from "../../../models/RechercheHistoriqueLimitation";
import {TypeSite} from "../../../models/enum/TypeSite.enum";

@Component({
  selector: 'app-limitation-indeminity-status',
  templateUrl: './limitation-indeminity-status.component.html',
  styleUrls: ['./limitation-indeminity-status.component.css']
})
export class LimitationIndeminityStatusComponent implements OnInit, OnChanges {
  @Input() historiqueLimitation?: RechercheHistoriqueLimitationEntite;

  IndeminityStatus = IndeminityStatus;

  instance?: Instance;
  loading = false;
  statusClass = "";
  canChangeStatus = false;
  showAbandonnedButton = false;
  indemnityStatus?: IndeminityStatus;

  constructor(
    public dialog: MatDialog,
    private instanceService: InstanceService,
    private indeminityStatusService: IndeminityStatusService,
  ) {
  }

  ngOnInit(): void {
    this.instanceService.getTypeInstance().subscribe(instance => {
      this.instance = instance;
      this.initComponent();
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initComponent();
  }

  private initComponent() {
    this.indemnityStatus = this.historiqueLimitation?.feedbackProducer?.indeminityStatus;
    switch (this.indemnityStatus) {
      case IndeminityStatus.InProgress:
        this.statusClass = "text-grey";
        break;
      case IndeminityStatus.Agreement:
        this.statusClass = "text-gray";
        break;
      case IndeminityStatus.Processed:
        this.statusClass = "text-success";
        break;
      case IndeminityStatus.WaitingInvoice:
        this.statusClass = "text-orange";
        break;
      case IndeminityStatus.InvoiceSent:
        this.statusClass = "text-success";
        break;
      case IndeminityStatus.Abandoned:
        this.statusClass = "text-danger";
        break;
    }
    this.showAbandonnedButton = showAbandonButton(this.historiqueLimitation, this.instance);
    this.canChangeStatus = canChangeIndeminityStatus(this.historiqueLimitation, this.instance);
  }

  onClick() {
    const dialogRef = this.dialog.open(LimitationIndeminityStatusChangeComponent, {
      width: '500px',
      data: {
        indeminityStatus: this.historiqueLimitation?.feedbackProducer.indeminityStatus,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined && this.historiqueLimitation != undefined) {
        this.loading = true;
        this.indeminityStatusService.updateIndeminisationStatus(this.historiqueLimitation.activationDocument.activationDocumentMrid).subscribe(
          (result) => {
            this.loading = false;
            if (this.historiqueLimitation) {
              this.historiqueLimitation.feedbackProducer.indeminityStatus = result;
            }
            this.initComponent();
          },
          (error) => {
            this.loading = false;
          }
        );
      }
    });
  }

  onAbandon() {
    if (this.historiqueLimitation != undefined) {
      this.loading = true;
      this.indeminityStatusService.abandonIndeminisationStatus(this.historiqueLimitation.activationDocument.activationDocumentMrid).subscribe(
        (result) => {
          this.loading = false;
          if (this.historiqueLimitation) {
            this.historiqueLimitation.feedbackProducer.indeminityStatus = result;
          }
          this.initComponent();
        },
        (error) => {
          this.loading = false;
        }
      );
    }
  }

}
