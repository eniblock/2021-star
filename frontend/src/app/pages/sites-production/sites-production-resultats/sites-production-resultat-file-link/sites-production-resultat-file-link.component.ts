import {Component, Input, OnInit} from '@angular/core';
import {ReserveBidService} from "../../../../services/api/reserve-bid.service";
import {KeycloakService} from "../../../../services/common/keycloak.service";
import {mergeMap} from "rxjs/operators";

@Component({
  selector: 'app-sites-production-resultat-file-link',
  templateUrl: './sites-production-resultat-file-link.component.html',
  styleUrls: ['./sites-production-resultat-file-link.component.css']
})
export class SitesProductionResultatFileLinkComponent implements OnInit {

  @Input() fileId: string = "";
  fileName: string = "";
  fileUrl: string = "";

  constructor(
    private reserveBidService: ReserveBidService,
  ) {
  }

  ngOnInit(): void {
    this.fileName = this.reserveBidService.getFileName(this.fileId);
    this.fileUrl = this.reserveBidService.getFileUrl(this.fileId);
  }


  download(event: any) {
    event.preventDefault();
    this.reserveBidService.download(this.fileUrl, this.fileName);
  }

}
