import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PATH_ROUTE } from 'src/app/app-routing.module';
import { FormulaireRechercheReseau } from 'src/app/models/RechercheReseau';
import { ReseauService } from 'src/app/services/api/reseau.service';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css'],
})
export class AccueilComponent implements OnInit {
  constructor(private router: Router, private reseauService: ReseauService) {}

  ngOnInit() {}

  rechercher(form: FormulaireRechercheReseau) {
    this.reseauService.enregistrerFormulaireRecherche(form);
    this.router.navigate([PATH_ROUTE.RESEAU]);
  }
}
