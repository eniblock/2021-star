# STAR BACKEND


## Création des comptes de producteurs
Enedis et RTE doivent choisir une personne qui sera l'admoinistrateur des comptes de producteurs.
C'est cette unique personne qui sera chargé de créer des comptes de producteurs. À ce titre, il sera l'unique détenteur des identifiants de l'interface d'administration des comptes de producteurs (producer keycloack)
Ci-dessous le processus à respecter pour créer les comptes de producteurs sur STAR.

### Envoi d'un fichier de producteurs
Pour créer de nouveaux producteurs, vous devez adresser à l'administrateur un fichier CSV contenant les caractéristiques des producteurs à créer.
Ce fichier doit contenir `producerMarketParticipantMrid;producerMarketParticipantName;producerMarketParticipantRoleType`.

Ci-dessous un exemple de fichier CSV à envoyer à l'administrateur 

```
producerMarketParticipantMrid;producerMarketParticipantName;producerMarketParticipantRoleType
17Y100A101R0629X;Prodtest;A21 - Producer
17Y100A102R0629X;Prod2;A21 - Producer
17Y100A103R0629X;Prod3;A21 - Producer
17Y100A104R0629X;prodrte;A21 - Producer
```

### Traitement du fichier de producteurs
Une fois reçu, l'administrateur va traiter le fichier CSV.
Il créera pour chaque producteur un login, un mot de passe.
Il ajoutera pour chaque utilisateur (sur Keycloack, menu Manage -> Users -> Attributes) un attribut ` producerMarketParticipantMrid`
qui correspond à la valeur indiqué dans le fichier CSV.

Après la création des producteurs, l'administrateur devra retourner un compte-rendu de création des utilisateurs qui sera sous forme d'un fichier CSV comme celui-ci

```
producerMarketParticipantMrid;login;password
17Y100A101R0629X;login_1;password_1
17Y100A102R0629X;login_2;password_2
17Y100A103R0629X;login_3;password_3
17Y100A104R0629X;login_4;password_4
```

Lancez 'yarn start' pour démarrer le serveur de développement.
Lancer votre nagivateur à l'adresse 'http://127.0.0.1:4200'

L'application sera automatiquement recompilée et rechargée dans le navigateur pour toutes modifications du code source.

'yarn start-devprod' permet de lancer un serveur compilé à l'identique de la prod (utile pour les tests e2e)

## Build de prod

Lancez 'yarn build' pour faire un build de prod. Le build sera généré dans le dossier /dist.
Le code sera compilé en ahead of time / minifié / optimisé / tree shaké (suppression de code inutilisé)

## Lancement des tests unitaires

Pour lancer les tests unitaires sur l'application lancez 'yarn test-auto' cela lance les tests puis reste en écoute pour relancer les tests unitaires pour tous changement dans le code source
Pensez à utiliser :
* 'fdescribe' et 'fit' pendant vos développement pour ne lancer qu'un périmètre restreint de tests.
* test-dev.ts et fournir un context plus précis pour les tests tel que require.context('./app/gateway/entite',...) pour limiter le scan des tests. Par défaut tout est scanné, ce qui est long.
Mais si vous ne les retirez pas avant de commiter, le périmètre de tests sera aussi restreint sur le jenkins !
(le linter vérifie ça pour vous)

## Running end-to-end tests

Pour plus de détails sur le démarrage d'un environnement en local : https://sixenedis.atlassian.net/wiki/spaces/CS/pages/674070709/Tests+E2E+AKA+End+to+End

Lancez 'yarn start-devprod' dans un terminal
Dans un second terminal lancez 'yarn webdriver:update-local' pour télécharger les binaires pour piloter les navigateurs, puis lancez 'yarn e2e-devprod' pour lancer les tests end to end.
Pensez à utiliser 'fdescribe' et 'fit' pendant vos développement pour ne lancer qu'un périmètre restreint de tests.
Mais si vous ne les retirez pas avant de commiter, le périmètre de tests sera aussi restreint sur le jenkins !
(le linter vérifie ça pour vous)
 