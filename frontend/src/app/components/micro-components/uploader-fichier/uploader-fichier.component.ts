import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgxFileDropComponent, NgxFileDropEntry } from 'ngx-file-drop';

interface Fichier {
  nom: string;
  taille: string;
  ngxFileDropEntry: NgxFileDropEntry; // Infos NgxFileDropEntry
  file: File; // Infos system
}

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

  public fichiers: Fichier[] = [];

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
          this.addFichier(droppedFile, file);
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

  private addFichier(droppedFile: NgxFileDropEntry, file: File) {
    console.log(droppedFile, file);
    this.fichiers.push({
      nom: droppedFile.fileEntry.name,
      taille: this.tailleFichier(file.size),
      ngxFileDropEntry: droppedFile,
      file: file,
    });
    this.fichiers.sort((f1, f2) =>
      f1.ngxFileDropEntry.fileEntry.name.localeCompare(
        f2.ngxFileDropEntry.fileEntry.name
      )
    );
  }

  private tailleFichier(tailleByte: number): string {
    if (tailleByte < 1000) {
      return tailleByte + ' octets';
    } else if (tailleByte < 1000000) {
      return Math.floor(tailleByte / 1000) + ' Ko';
    } else if (tailleByte < 1000000000) {
      return Math.floor(tailleByte / 1000000) + ' Mo';
    } else {
      return Math.floor(tailleByte / 1000000000) + ' Go';
    }
  }
}
