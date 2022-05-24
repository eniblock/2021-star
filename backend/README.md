# Backend STAR

Backend du projet STAR.

## Configuration

    - nom: backend
    - port: 8080

## Environnements

    -> Spring Framework
    -> SpringBoot 2.6.7
    -> Java 11

## Dépendances

    -> Spring Security 2.6.7
    -> Actuator 2.6.7
    -> Keycloak 18
    -> Swagger 1.5.2
    -> Mapstruct 1.4.2.Final
    -> Hyperledger Fabric 2.1.0

## Pré-requis pour démarrer le projet

    -> Maven 3+
    -> Java JDK 11
    -> Git
    -> Intellij
       
## Fonctionnalités/APIs portées

Consulter Swagger UI :

    - RTE : rte.localhost/swagger-ui.html
    - ENEDIS : enedis.localhost/swagger-ui.html
    - PRODUCER : producer.localhost/swagger-ui.html

Toutes les APIs sont codées dans le packgae ``com.star.rest`` du module ``api``.

## Echanges avec d'autres entités

    -> Keycloak (Authentification et gestion des profils et des droits)
    -> HyperLedger Fabric (Ecriture et lecture de données dans la blockchain)
    -> Frontend Angular (Fournir les données via les APIs exposées)