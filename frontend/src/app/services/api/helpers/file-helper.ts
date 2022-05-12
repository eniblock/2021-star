export class FileHelper {

  public static appendFiles(formData: FormData, files: File[]) {
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i], files[i].name);
    }
  }

}
