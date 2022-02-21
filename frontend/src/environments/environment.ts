// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  serverUrl: '/api/v0',
  hmr: false,
  keycloak: {
    // Url of the Identity Provider
    issuer: '', //https://star.localhost/auth/
    // Realm
    realm: 'star',
    clientId: 'frontend',
  },
  // Tri
  pageSizes: [5, 10, 20],
  // Upload des fichiers
  tailleMaxUploadFichiers: 5000000, // En octets
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
