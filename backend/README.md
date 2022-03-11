# STAR BACKEND


## Création des comptes de producteurs
Enedis et RTE doivent choisir une personne qui sera l'administrateur des comptes de producteurs.
C'est cette unique personne qui sera chargée de créer des comptes de producteurs. 
À ce titre, il sera l'unique détenteur des identifiants de l'interface d'administration des comptes de producteurs (Interface Keycloack des instances de producteurs).
Ci-dessous le processus à respecter pour créer les comptes de producteurs sur STAR.

### Etape 1 - Envoi d'un fichier de producteurs
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

Après la création des producteurs, l'administrateur devra retourner un compte-rendu de création des utilisateurs qui sera sous forme d'un fichier CSV comme
ci-dessous.

```
producerMarketParticipantMrid;login;password
17Y100A101R0629X;login_1;password_1
17Y100A102R0629X;login_2;password_2
17Y100A103R0629X;login_3;password_3
17Y100A104R0629X;login_4;password_4
```

NB : En option, en création des utilisateurs, l'administrateur pourra configurer les comptes pour que les producteurs soient obligés de réinitialiser leurs mots de passe à la 1ère connexion. À valider avec RTE/Enedis.
