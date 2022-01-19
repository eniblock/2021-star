import { Component, OnInit } from '@angular/core';
import { RechercheReseauForm } from 'src/app/models/RechercheReseau';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css'],
})
export class AccueilComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  rechercher(form: RechercheReseauForm) {
    console.log(form);
  }
}
