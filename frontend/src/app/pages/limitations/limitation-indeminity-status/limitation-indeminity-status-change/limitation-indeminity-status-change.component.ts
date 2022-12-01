import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {IndeminityStatus} from "../../../../models/enum/IndeminityStatus.enum";
import {InstanceService} from "../../../../services/api/instance.service";
import {Instance} from "../../../../models/enum/Instance.enum";

export interface DialogDataLimitationStatus {
  indeminityStatus: IndeminityStatus;
}

@Component({
  selector: 'app-limitation-indeminity-status-change',
  templateUrl: './limitation-indeminity-status-change.component.html',
  styleUrls: ['./limitation-indeminity-status-change.component.css']
})
export class LimitationIndeminityStatusChangeComponent implements OnInit {

  InstanceEnum = Instance;
  instance?: Instance;
  nextStatus?: IndeminityStatus

  constructor(
    private instanceService: InstanceService,
    public dialogRef: MatDialogRef<LimitationIndeminityStatusChangeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDataLimitationStatus,
  ) {
  }

  ngOnInit(): void {
    this.instanceService.getTypeInstance().subscribe((typeInstance) => {
      this.instance = typeInstance;

      // TODO !!!!!!!!!!
      // this.nextStatus= ...
    });
  }

}
