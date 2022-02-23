import { ActivationsService } from 'src/app/services/api/activations.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PATH_ROUTE } from 'src/app/app-routing.module';
import { FormulaireRechercheActivations } from 'src/app/models/RechercheActivations';
import { FormulaireRechercheReseau } from 'src/app/models/RechercheReseau';
import { ReseauService } from 'src/app/services/api/reseau.service';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css'],
})
export class AccueilComponent implements OnInit {
  PATH_ROUTE = PATH_ROUTE;

  constructor(
    private router: Router,
    private reseauService: ReseauService,
    private activationsService: ActivationsService
  ) {}

  ngOnInit() {}

  formRechercheReseauSubmit(form: FormulaireRechercheReseau) {
    this.reseauService.pushFormulaireRecherche(form);
    this.router.navigate(['/', PATH_ROUTE.RESEAU]);
  }

  formRechercheActivationsSubmit(form: FormulaireRechercheActivations) {
    this.activationsService.pushFormulaireRecherche(form);
    this.router.navigate(['/', PATH_ROUTE.ACTIVATIONS]);
  }
}
