import {Component, Input, OnInit} from '@angular/core';
import {InstanceService} from "../../../services/api/instance.service";
import {Instance} from "../../../models/enum/Instance.enum";
import {RechercheHistoriqueLimitationEntite} from "../../../models/RechercheHistoriqueLimitation";

@Component({
  selector: 'app-form-ene-eni',
  templateUrl: './form-ene-eni.component.html',
  styleUrls: ['./form-ene-eni.component.css']
})
export class FormEneEniComponent implements OnInit {
  @Input() initialFormData?: RechercheHistoriqueLimitationEntite;

  InstanceEnum = Instance;

  instance?: Instance;

  constructor(
    private instanceService: InstanceService
  ) {
  }

  ngOnInit(): void {
    this.instanceService.getTypeInstance().subscribe(instance => this.instance = instance);
  }

}
