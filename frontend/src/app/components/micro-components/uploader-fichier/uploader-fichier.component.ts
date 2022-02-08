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
  extensionAccepte: boolean; // Indique si l'extension du fichier est non accepté
}

export interface ListeFichiersEtEtat {
  fichiers: Fichier[];
  tailleFichierOk: boolean; // indique si la taille des fichiers n'est pas trop grande
  extensionFichiersOk: boolean; // indique si tous fichiers ont la bonne extension
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

    // Si on n'est pas en multiple => on ajoute 1 seul fichier (le premier)
    if (!this.multiple && nouveauFichiers.length > 1) {
      nouveauFichiers = [nouveauFichiers[0]];
    }

    for (const droppedFile of nouveauFichiers) {
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

  private extensionAcceptee(fichier: NgxFileDropEntry): boolean {
    return (
      this.accept == '*' ||
      this.accept
        .split(',')
        .some((extension) => fichier.fileEntry.name.endsWith(extension))
    );
  }

  private addFichier(droppedFile: NgxFileDropEntry, file: File) {
    const extensionAcceptee = this.extensionAcceptee(droppedFile);
    const fichier: Fichier = {
      nom: droppedFile.fileEntry.name,
      taille: file.size,
      tailleStr: tailleFichierToStr(file.size),
      ngxFileDropEntry: droppedFile,
      file: file,
      extensionAccepte: extensionAcceptee,
    };
    this.fichiers.push(fichier);
    this.fichiers.sort((f1, f2) =>
      f1.ngxFileDropEntry.fileEntry.name.localeCompare(
        f2.ngxFileDropEntry.fileEntry.name
      )
    );
    this.majTailleTotalFichiers();
  }

  deleteFichier(fichier: Fichier) {
    this.fichiers = this.fichiers.filter((f) => f != fichier);
    this.majTailleTotalFichiers();
  }

  private majTailleTotalFichiers() {
    this.tailleFichiers =
      this.fichiers.length == 0
        ? 0
        : this.fichiers
            .map((fichier) => (fichier.extensionAccepte ? fichier.taille : 0))
            .reduce((t1, t2) => t1 + t2);
    this.tailleFichiersStr = tailleFichierToStr(this.tailleFichiers);

    const tailleFichierOk =
      this.fichiers.length > 0 &&
      (this.tailleMaxFichiers == null ||
        this.tailleFichiers <= this.tailleMaxFichiers);

    const extensionFichiersOk = this.fichiers.every(
      (fichier) => fichier.extensionAccepte
    );

    this.listeFichiersModifiees.emit({
      fichiers: this.fichiers,
      tailleFichierOk: tailleFichierOk,
      extensionFichiersOk: extensionFichiersOk,
    });
  }
}
