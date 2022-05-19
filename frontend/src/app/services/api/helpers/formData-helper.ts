export class FormDataHelper {

  public static appendFiles(formData: FormData, files: File[]) {
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i], files[i].name);
    }
  }

  public static appendObject(formData: FormData, objectName: string, object: any) {
    formData.append('content-type', 'multipart/data');
    formData.append(objectName, new Blob([JSON.stringify(object)], { type: 'application/json' }));
  }
}
