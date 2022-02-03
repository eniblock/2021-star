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

  public fichiers: NgxFileDropEntry[] = [];

  constructor() {}

  ngOnInit() {}

  public dropped(nouveauFichiers: NgxFileDropEntry[]) {
    if (this.fichiers.length > 0 && !this.multiple) {
      // Pas d'ajout de fichier si on n'est pas en multiple
      return;
    }

    // On filtre en fonction de l'extension
    let fichiersFiltres = this.filtrerParExtension(nouveauFichiers);

    // Si on n'est pas en multiple => on ajoute 1 seul fichier (le premier)
    if (!this.multiple && fichiersFiltres.length > 1) {
      fichiersFiltres = [fichiersFiltres[0]];
    }

    for (const droppedFile of fichiersFiltres) {
      if (droppedFile.fileEntry.isFile) {
        // On ajoute des fichiers
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.addFichier(droppedFile);
        });
      } else {
        // On ajoute un repertoire vide
      }
    }
  }

  private filtrerParExtension(
    fichiers: NgxFileDropEntry[]
  ): NgxFileDropEntry[] {
    if (this.accept == '*') {
      return fichiers;
    }
    let extensions = this.accept.split(',');
    return fichiers.filter((f) =>
      extensions.some((extension) => f.fileEntry.name.endsWith(extension))
    );
  }

  private addFichier(droppedFile: NgxFileDropEntry) {
    this.fichiers.push(droppedFile);
    this.fichiers.sort((f1, f2) =>
      f1.fileEntry.name.localeCompare(f2.fileEntry.name)
    );
  }
}
