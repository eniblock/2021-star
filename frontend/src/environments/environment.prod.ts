export const environment = {
  production: true,
  activeCache: true,
  serverUrl: '/api/v0',
  hmr: false,
  keycloak: {
    // Url of the Identity Provider
    issuer: '',
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
