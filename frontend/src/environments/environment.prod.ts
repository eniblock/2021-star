export const environment = {
  production: true,
  serverUrl: '/api/v0',
  hmr: false,
  keycloak: {
    // Url of the Identity Provider
    issuer: '',
    // Realm
    realm: 'star',
    clientId: 'frontend',
  },
  // Tri
  pageSizes: [5, 10, 20],
  // Upload des fichiers
  tailleMaxUploadFichiers: 5000000, // En octets
  // Interval de dates max recherche historique de limitation (en jours)
  intervalDateMaxRechercheHistoriqueLimitation : 7,
};
