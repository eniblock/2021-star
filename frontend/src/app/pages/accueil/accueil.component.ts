import { Component, OnInit } from '@angular/core';
import { Instance } from 'src/app/models/enum/instance.enum';
import { InstanceService } from '../../services/api/instance.service';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css'],
})
export class AccueilComponent implements OnInit {
  instance: Instance | undefined = undefined;

  constructor(private instanceService: InstanceService) {}

  ngOnInit() {
    this.instanceService
      .get()
      .subscribe((instance) => (this.instance = instance));
  }
}
