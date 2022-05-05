import { Instance } from 'src/app/models/enum/Instance.enum';
import { InstanceService } from 'src/app/services/api/instance.service';
import { Component, OnInit } from '@angular/core';

export enum TypeImport {
  OrdreDebutLimitation = 'Ordre de début de limitation',
  OrdreFinLimitation = 'Ordre de fin de limitation',
  OrdreDebutEtFinLimitation = 'Ordre de début et de fin de limitation',
  CourbeComptageReference = 'Courbe de comptage/référence',
  CourbeComptage = 'Courbe de comptage',
}

@Component({
  selector: 'app-charger',
  templateUrl: './charger.component.html',
  styleUrls: ['./charger.component.css'],
})
export class ChargerComponent implements OnInit {
  TypeImportEnum = TypeImport;

  typesImport: TypeImport[] = [];
  typeImportSelected?: TypeImport;

  constructor(private instanceService: InstanceService) {}

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
          TypeImport.CourbeComptageReference
        ];
        break;
      case Instance.DSO:
        this.typesImport = [
          TypeImport.CourbeComptage
        ];
        break;
      case Instance.PRODUCER:
        this.typesImport = [];
        break;
    }
  }

  public onSelectTypeImport(typeImport: TypeImport) {
    this.typeImportSelected = typeImport;
  }
}
