import {Component, Input, OnInit} from '@angular/core';
import {ReserveBidStatus} from "../../../models/enum/ReserveBidStatus.enum";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ReserveBidService} from "../../../services/api/reserve-bid.service";
import {ReserveBid} from "../../../models/ReserveBid";

@Component({
  selector: 'app-form-reserve-bid-status',
  templateUrl: './form-reserve-bid-status.component.html',
  styleUrls: ['./form-reserve-bid-status.component.css']
})
export class FormReserveBidStatusComponent implements OnInit {

  @Input() reserveBid?: ReserveBid;

  form: FormGroup = this.formBuilder.group({
    reserveBidStatus: ['', Validators.required],
  });

  ReserveBidStatusEnum = ReserveBidStatus;

  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private reserveBidService: ReserveBidService,
  ) {
  }

  ngOnInit(): void {
    this.form.get('reserveBidStatus')?.setValue(this.reserveBid?.reserveBidStatus);
  }

  changeStatus() {
    if (this.reserveBid == null) {
      return;
    }
    const newStatus = this.form.get('reserveBidStatus')?.value;
    this.loading = true;
    this.reserveBidService.modifyStatus(newStatus, this.reserveBid!.reserveBidMrid)
      .subscribe(
        (ok) => {
          this.loading = false;
        },
        (error) => {
          this.loading = false;
        }
      );
  }
}
