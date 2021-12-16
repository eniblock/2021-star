export const environment = {
  production: true,
  serverUrl: '/api',
  hmr: false,
  keycloak: {
    // Url of the Identity Provider
    issuer: '',
    // Realm
    realm: 'star',
    clientId: 'frontend',
  },
};
