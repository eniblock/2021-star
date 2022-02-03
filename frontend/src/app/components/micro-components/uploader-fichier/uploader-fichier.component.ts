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
    this.files = files;
    for (const droppedFile of files) {
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
          console.log(droppedFile.relativePath, file);

          /**
          // You could upload it like this:
          const formData = new FormData()
          formData.append('logo', file, relativePath)

          // Headers
          const headers = new HttpHeaders({
            'security-token': 'mytoken'
          })

          this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
          .subscribe(data => {
            // Sanitized logo returned from backend
          })
          **/
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }
}
