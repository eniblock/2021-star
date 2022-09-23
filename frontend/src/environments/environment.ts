// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  activeCache: true,
  serverUrl: '/api/v0',
  hmr: false,
  keycloak: {
    // Url of the Identity Provider
    issuer: '', //https://star.localhost/auth/
    // Realm
    realm: 'star',
    clientId: 'frontend',
  },
  // Upload des fichiers (en octets)
  tailleMaxUploadFichiers: 5000000,
  // Interval de dates max recherche historique de limitation (en jours)
  intervalDateMaxRechercheHistoriqueLimitation: 7,
  // Duree d'affichage des messages d'erreur / de succès (en secondes)
  snackBarSuccessTime: 5 * 1000,
  snackBarErrorTime: 2 * 60 * 1000,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
