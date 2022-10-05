import {Component, Input, OnInit} from '@angular/core';
import {ReserveBidService} from "../../../../services/api/reserve-bid.service";

@Component({
  selector: 'app-sites-porduction-resultat-file-link',
  templateUrl: './sites-porduction-resultat-file-link.component.html',
  styleUrls: ['./sites-porduction-resultat-file-link.component.css']
})
export class SitesPorductionResultatFileLinkComponent implements OnInit {

  @Input() fileId: string = "";
  fileName: string = "";
  fileUrl: string = ""

  constructor(
    private reserveBidService: ReserveBidService,
  ) {
  }

  ngOnInit(): void {
    this.fileName = this.reserveBidService.getFileName(this.fileId);
    this.fileUrl = this.reserveBidService.getFileUrl(this.fileId);
  }

}
