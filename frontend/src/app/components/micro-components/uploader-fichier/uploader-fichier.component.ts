import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgxFileDropComponent, NgxFileDropEntry } from 'ngx-file-drop';

@Component({
  selector: 'app-uploader-fichier',
  templateUrl: './uploader-fichier.component.html',
  styleUrls: ['./uploader-fichier.component.css'],
})
export class UploaderFichierComponent implements OnInit {
  @ViewChild('ngxFileDrop') ngxFileDrop?: NgxFileDropComponent;

  @Input() public accept: string = '*'; // Exemple : '.pdf,.doc'
  @Input() public directory: boolean = false;
  @Input() public multiple: boolean = false;
  @Input() public className: string = '';

  public files: NgxFileDropEntry[] = [];

  constructor() {}

  ngOnInit() {}

  public dropped(files: NgxFileDropEntry[]) {
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        // On ajoute des fichiers
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.files.push(droppedFile);
        });
      } else {
        // On ajoute un repertoire vide
      }
    }
  }
}
