import {Instance} from 'src/app/models/enum/Instance.enum';
import {InstanceService} from 'src/app/services/api/instance.service';
import {Component, OnInit} from '@angular/core';
import {Navigation, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

export enum TypeImport {
  OrdreDebutLimitation = 'Ordre de début de limitation',
  OrdreFinLimitation = 'Ordre de fin de limitation',
  OrdreDebutEtFinLimitation = 'Ordre de début et de fin de limitation',
  CourbeComptageReference = 'Courbe de comptage/référence',
  CourbeComptage = 'Courbe de comptage',
  EneEni = 'ENE/ENI',
}

@Component({
  selector: 'app-charger',
  templateUrl: './charger.component.html',
  styleUrls: ['./charger.component.css'],
})
export class ChargerComponent implements OnInit {
  TypeImportEnum = TypeImport;

  form: FormGroup = this.formBuilder.group({
    typeImportSelected: [null]
  });

  typesImport: TypeImport[] = [];
  initialFormData: any;

  constructor(
    private formBuilder: FormBuilder,
    private instanceService: InstanceService,
    private router: Router,
  ) {
    // We load a form if "state.typeImport" in the router call is fullfilled
    const nav: Navigation | null = this.router.getCurrentNavigation();
    if (nav != null && nav.extras && nav.extras.state && nav.extras.state.typeImport) {
      this.form.get("typeImportSelected")?.setValue(nav.extras.state.typeImport);
      this.initialFormData = nav.extras.state.formData;
    }
  }

  ngOnInit() {
    this.instanceService.getTypeInstance().subscribe((instance) => {
      this.initTypeImport(instance);
    });
  }

  private initTypeImport(instance: Instance) {
    switch (instance) {
      case Instance.TSO:
        this.typesImport = [
          TypeImport.OrdreDebutLimitation,
          TypeImport.OrdreFinLimitation,
          TypeImport.OrdreDebutEtFinLimitation,
          TypeImport.CourbeComptageReference,
          TypeImport.EneEni
        ];
        break;
      case Instance.DSO:
        this.typesImport = [
          TypeImport.CourbeComptage,
          TypeImport.EneEni
        ];
        break;
      case Instance.PRODUCER:
        this.typesImport = [];
        break;
    }
  }

}
