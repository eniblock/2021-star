import {Component, OnInit} from '@angular/core';
import {Instance} from "../../../models/enum/Instance.enum";
import {InstanceService} from "../../../services/api/instance.service";
import {ReconciliationService} from "../../../services/api/reconciliation.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  InstanceEnum = Instance;

  hasNotifs = false;
  typeInstance?: Instance;

  pendingReconciliation = false;

  constructor(
    private instanceService: InstanceService,
    private reconciliationService: ReconciliationService,
  ) {
    this.instanceService.getTypeInstance()
      .subscribe((typeInstance) => this.typeInstance = typeInstance);
  }

  reconciliate() {
    this.pendingReconciliation = true;
    this.reconciliationService.reconciliate()
      .subscribe(
        ok => this.pendingReconciliation = false
      );
  }

}
