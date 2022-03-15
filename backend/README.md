# STAR BACKEND

## Création des comptes de producteurs
Enedis et RTE doivent choisir une personne qui sera l'administrateur des comptes de producteurs.
C'est cette unique personne qui sera chargée de créer des comptes de producteurs. 
À ce titre, il sera l'unique détenteur des identifiants de l'interface d'administration des comptes de producteurs (Interface Keycloack des instances de producteurs).

### Etape 1 - Envoi d'un fichier de producteurs
Pour créer de nouveaux producteurs, vous devez adresser à l'administrateur un fichier CSV contenant les caractéristiques des producteurs à créer.
Ce fichier doit contenir les informations suivantes : 
 - `producerMarketParticipantMrid`,
 - `producerMarketParticipantName`,
 - `producerMarketParticipantRoleType`

Vous trouverez ci-dessous un exemple de fichier CSV à envoyer à l'administrateur.

```
producerMarketParticipantMrid;producerMarketParticipantName;producerMarketParticipantRoleType
17Y100A101R0629X;Prodtest;A21 - Producer
17Y100A102R0629X;Prod2;A21 - Producer
```

### Etape 2 - Traitement du fichier de producteurs et compte-rendu
L'administrateur va traiter le fichier CSV reçu.
Il créera pour chaque producteur un login et un mot de passe.
Il ajoutera pour chaque utilisateur un attribut ` producerMarketParticipantMrid`
qui correspond à la valeur indiquée dans le fichier CSV (sur Keycloack, menu Manage -> Users -> Attributes).

Après la création des producteurs et l'attribution de leurs attributs respectifs, l'administrateur devra retourner un compte-rendu de création des utilisateurs qui sera sous forme d'un fichier CSV comme
ci-dessous.

```
producerMarketParticipantMrid;login;password
17Y100A101R0629X;login_1;password_1
17Y100A102R0629X;login_2;password_2
```

NB : En option, en création des utilisateurs, l'administrateur peut configurer les comptes pour que les producteurs soient obligés de réinitialiser leurs mots de passe à la 1ère connexion (À confirmer avec RTE/Enedis)
