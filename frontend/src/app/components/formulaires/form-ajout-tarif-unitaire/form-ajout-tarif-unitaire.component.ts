import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {environment} from "../../../../environments/environment";
import {Fichier, ListeFichiersEtEtat} from "../../micro-components/uploader-fichier/uploader-fichier.component";
import {FormulaireReserveBid} from "../../../models/ReserveBid";
import {ReserveBidService} from "../../../services/api/reserve-bid.service";

@Component({
  selector: 'app-form-ajout-tarif-unitaire',
  templateUrl: './form-ajout-tarif-unitaire.component.html',
  styleUrls: ['./form-ajout-tarif-unitaire.component.css']
})
export class FormAjoutTarifUnitaireComponent implements OnInit {
  form: FormGroup = this.formBuilder.group({
    energyPriceAmount: ['', [Validators.required, Validators.pattern('[0-9]*[\,\.]?[0-9]*')]],
    validityPeriodStartDateTime: ['', Validators.required],
  });

  loading = false;

  tailleMaxUploadFichiers = environment.tailleMaxUploadFichiers;
  tailleMaxUploadFichiersStr = environment.tailleMaxUploadFichiers / 1000000 + " Mo";

  tailleFichierOk = false;
  extensionFichiersOk = false;
  listeFichiers: Fichier[] = [];
  errors: string[] = [];

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public bottomSheetParams: {
      meteringPointMrid: string;
    },
    private formBuilder: FormBuilder,
    private bottomsheet: MatBottomSheetRef<FormAjoutTarifUnitaireComponent>,
    private reserveBidService: ReserveBidService,
  ) {
  }

  ngOnInit(): void {
  }

  public modificationListeFichiers(listeFichiersEtEtat: ListeFichiersEtEtat) {
    this.tailleFichierOk = listeFichiersEtEtat.tailleFichierOk;
    this.extensionFichiersOk = listeFichiersEtEtat.extensionFichiersOk;
    this.listeFichiers = listeFichiersEtEtat.fichiers;
  }

  onSubmit() {
    this.loading = true;
    const form: FormulaireReserveBid = {
      energyPriceAmount: +(this.form.get('energyPriceAmount')?.value?.replace(',', '.')),
      validityPeriodStartDateTime: this.form.get('validityPeriodStartDateTime')?.value,
      meteringPointMrid: this.bottomSheetParams.meteringPointMrid,
    };
    const files = this.listeFichiers.map((f) => f.file);

    this.reserveBidService.createReserveBid(form, files).subscribe(
      (ok) => {
        this.loading = false;
        this.bottomsheet.dismiss(form);
      },
      (error) => {
        this.loading = false;
      }
    );
  }

}
