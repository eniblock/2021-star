import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgxFileDropComponent, NgxFileDropEntry } from 'ngx-file-drop';
import { tailleFichierToStr } from './uploader-fichier-tools';

export interface Fichier {
  nom: string;
  taille: number;
  tailleStr: string;
  ngxFileDropEntry: NgxFileDropEntry; // Infos NgxFileDropEntry
  file: File; // Infos system
}

export interface ListeFichiersEtEtat {
  fichiers: Fichier[];
  ok: boolean; // indique si tout est ok (taille des fichiers et présence d'au moins un fichier)
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
  @Input() public tailleMaxFichiers: number | null = null; //Taille max autorisée pour l'uploade

  @Output() listeFichiersModifiees = new EventEmitter<ListeFichiersEtEtat>();

  public fichiers: Fichier[] = [];
  public tailleFichiers = 0;
  public tailleFichiersStr = '0 octets';

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
    const fichier: Fichier = {
      nom: droppedFile.fileEntry.name,
      taille: file.size,
      tailleStr: tailleFichierToStr(file.size),
      ngxFileDropEntry: droppedFile,
      file: file,
    };
    this.fichiers.push(fichier);
    this.fichiers.sort((f1, f2) =>
      f1.ngxFileDropEntry.fileEntry.name.localeCompare(
        f2.ngxFileDropEntry.fileEntry.name
      )
    );

    this.majTailleTotalFichiers(fichier.taille);
  }

  deleteFichier(fichier: Fichier) {
    this.fichiers = this.fichiers.filter((f) => f != fichier);
    this.majTailleTotalFichiers(-1 * fichier.taille);
  }

  private majTailleTotalFichiers(tailleNouveauFichier: number) {
    this.tailleFichiers += tailleNouveauFichier;
    this.tailleFichiersStr = tailleFichierToStr(this.tailleFichiers);

    const uploaderFichierOk =
      this.fichiers.length > 0 &&
      (this.tailleMaxFichiers == null ||
        this.tailleFichiers <= this.tailleMaxFichiers);

    this.listeFichiersModifiees.emit({
      fichiers: this.fichiers,
      ok: uploaderFichierOk,
    });
  }
}
