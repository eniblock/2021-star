import {KeycloakService} from "keycloak-angular";
import {environment} from "../../environments/environment";

export function keycloakInitializer(
  keycloak: KeycloakService,
): () => Promise<unknown> {
  return (): Promise<unknown> => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await keycloak.init({
          config: {
            url:
              environment.keycloak.issuer ||
              window.location.protocol +
              '//' +
              window.location.hostname +
              (window.location.port ? ':' + window.location.port : '') +
              '/auth/',
            realm: environment.keycloak.realm,
            clientId: environment.keycloak.clientId,
          },
          loadUserProfileAtStartUp: false,
          initOptions: {
            onLoad: 'check-sso',
            checkLoginIframe: true,
          },
          bearerExcludedUrls: [],
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };
}
