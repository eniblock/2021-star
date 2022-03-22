import { Component, Inject, OnInit, enableProdMode } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import {
  GraphData,
  jsonDateToValueX,
  Point,
} from 'src/app/components/graph/square-graph/square-graph.component';
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
  graphData?: GraphData;

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
    console.log(this.bottomSheetParams, this.data);

    let measurementUnitName: MeasurementUnitName | undefined;
    let serieNames: string[] = [];
    let data: Point[][] = [];

    // 1) Tests on component params
    const startCreatedDateTimeConsign =
      this.bottomSheetParams.startCreatedDateTime;
    const endCreatedDateTimeConsign = this.bottomSheetParams.endCreatedDateTime;
    const orderValueConsign = this.bottomSheetParams.orderValueConsign;
    if (
      startCreatedDateTimeConsign == null ||
      endCreatedDateTimeConsign == null ||
      orderValueConsign == null
    ) {
      this.invalidData = true;
      return;
    }

    // 2) We get the measurementUnitName
    measurementUnitName = this.bottomSheetParams.measurementUnitNameConsign;
    this.data.forEach((d) => {
      if (
        measurementUnitName != null &&
        d.measurementUnitName != measurementUnitName
      ) {
        // If we have MW and KW => we choose KW
        measurementUnitName = MeasurementUnitName.KW;
      }
    });
    if (measurementUnitName == null) {
      this.invalidData = true;
      return;
    }

    // 3) The consign
    serieNames.push('Consigne'),
      data.push([
        {
          x: jsonDateToValueX(startCreatedDateTimeConsign),
          y: orderValueConsign,
        },
        {
          x: jsonDateToValueX(endCreatedDateTimeConsign),
          y: orderValueConsign,
        },
      ]);

    //////////////////////////////////////
    if (data.length == 0) {
      this.invalidData = true;
      return;
    }

    // Final : the graph data
    this.graphData = {
      yTitle: `Puissance ${measurementUnitName}`,
      serieNames: serieNames,
      data: data,
      exportFileName: `${this.bottomSheetParams.meteringPointMrid}-${this.bottomSheetParams.startCreatedDateTime}-${this.bottomSheetParams.endCreatedDateTime}`,
    };

    console.log(this.graphData);
  }
}
