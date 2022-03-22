import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { GraphData } from 'src/app/components/graph/square-graph/square-graph.component';
import { EnergyAccount } from 'src/app/models/EnergyAccount';
import { MeasurementUnitName } from 'src/app/models/enum/MeasurementUnitName.enum';
import { EnergyAccountService } from 'src/app/services/api/energy-account.service';

@Component({
  selector: 'app-activation-graph',
  templateUrl: './activation-graph.component.html',
  styleUrls: ['./activation-graph.component.css'],
})
export class ActivationGraphComponent implements OnInit {
  data: EnergyAccount[] = [];
  graphData?: GraphData = {
    yTitle: 'Puissance (MW)',
    serieNames: ['Référence', 'Consigne'],
    data: [
      [
        { x: new Date('2015/04/29 11:24:00').getTime(), y: 8 },
        { x: new Date('2015/04/29 11:28:00').getTime(), y: 4 },
        { x: new Date('2015/04/29 12:24:00').getTime(), y: 3 },
        { x: new Date('2015/04/29 13:00:00').getTime(), y: 3 },
      ],
      [
        { x: new Date('2015/04/29 11:24:00').getTime(), y: 1 },
        { x: new Date('2015/04/29 11:29:00').getTime(), y: 2 },
        { x: new Date('2015/04/29 11:50:00').getTime(), y: 2 },
        { x: new Date('2015/04/29 12:10:00').getTime(), y: 1 },
        { x: new Date('2015/04/29 12:15:00').getTime(), y: 7 },
        { x: new Date('2015/04/29 14:00:00').getTime(), y: 7 },
      ],
    ],
    exportFileName: 'monFichier',
  };

  invalidData = false;

  constructor(
    private energyAccountService: EnergyAccountService,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public bottomSheetParams: {
      meteringPointMrid: string;
      startCreatedDateTime?: string;
      endCreatedDateTime?: string;
      orderValueConsign?: number;
      measurementUnitNameConsign?: MeasurementUnitName;
    }
  ) {}

  ngOnInit() {
    const startCreatedDateTime = this.bottomSheetParams.startCreatedDateTime;
    const endCreatedDateTime = this.bottomSheetParams.endCreatedDateTime;
    console.log(this.bottomSheetParams);
    if (startCreatedDateTime == null || endCreatedDateTime == null) {
      this.invalidData = true;
    } else {
      this.energyAccountService
        .find(
          this.bottomSheetParams.meteringPointMrid,
          startCreatedDateTime,
          endCreatedDateTime
        )
        .subscribe((data) => {
          this.data = data;
          this.makeGraph();
        });
    }
  }

  makeGraph() {
    console.log(this.data);
  }
}
