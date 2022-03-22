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

    let globalMeasurementUnitName: MeasurementUnitName;
    let serieNames: string[] = [];
    let data: Point[][] = [];

    // 1) Tests on component params
    const startCreatedDateTimeConsign =
      this.bottomSheetParams.startCreatedDateTime;
    const endCreatedDateTimeConsign = this.bottomSheetParams.endCreatedDateTime;
    const orderValueConsign = this.bottomSheetParams.orderValueConsign;
    const measurementUnitNameConsign =
      this.bottomSheetParams.measurementUnitNameConsign;
    if (
      startCreatedDateTimeConsign == null ||
      endCreatedDateTimeConsign == null ||
      orderValueConsign == null ||
      measurementUnitNameConsign == null
    ) {
      this.invalidData = true;
      return;
    }

    // 2) We get the measurementUnitName
    globalMeasurementUnitName = measurementUnitNameConsign;
    this.data.forEach((d) => {
      if (
        d.measurementUnitName != null &&
        d.measurementUnitName != globalMeasurementUnitName
      ) {
        // If we have MW and KW => we choose KW
        globalMeasurementUnitName = MeasurementUnitName.KW;
      }
    });

    // 3) The consign
    serieNames.push('Consigne'),
      data.push([
        {
          x: jsonDateToValueX(startCreatedDateTimeConsign),
          y: this.toUnit(
            orderValueConsign,
            measurementUnitNameConsign,
            globalMeasurementUnitName
          ),
        },
        {
          x: jsonDateToValueX(endCreatedDateTimeConsign),
          y: this.toUnit(
            orderValueConsign,
            measurementUnitNameConsign,
            globalMeasurementUnitName
          ),
        },
      ]);

    // The other data
    let d = this.data.sort((d1, d2) => {
      let comp = d1.processType.localeCompare(d2.processType);
      if (comp == 0) {
        return d1.timeInterval.localeCompare(d2.timeInterval);
      } else {
        return comp;
      }
    });
    console.log(d);

    //////////////////////////////////////
    if (data.length == 0) {
      this.invalidData = true;
      return;
    }

    // Final : the graph data
    this.graphData = {
      yTitle: `Puissance ${globalMeasurementUnitName}`,
      serieNames: serieNames,
      data: data,
      exportFileName: `${this.bottomSheetParams.startCreatedDateTime}_${this.bottomSheetParams.endCreatedDateTime}_${this.bottomSheetParams.meteringPointMrid}`,
    };

    console.log(this.graphData);
  }

  toUnit(
    value: number,
    from: MeasurementUnitName,
    to: MeasurementUnitName
  ): number {
    if (from == to) {
      return value;
    } else if (from == MeasurementUnitName.MW) {
      return value * 1000;
    } else {
      return value / 1000;
    }
  }
}
