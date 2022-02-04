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
};
