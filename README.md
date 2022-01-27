# STAR (Smart Traceability of the Activations of Renewable generation flexibilities)

[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=xdev-tech_star&metric=bugs)](https://sonarcloud.io/dashboard?id=xdev-tech_star)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=xdev-tech_star&metric=code_smells)](https://sonarcloud.io/dashboard?id=xdev-tech_star)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=xdev-tech_star&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=xdev-tech_star)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=xdev-tech_star&metric=ncloc)](https://sonarcloud.io/dashboard?id=xdev-tech_star)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=xdev-tech_star&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=xdev-tech_star)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=xdev-tech_star&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=xdev-tech_star)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=xdev-tech_star&metric=security_rating)](https://sonarcloud.io/dashboard?id=xdev-tech_star)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=xdev-tech_star&metric=sqale_index)](https://sonarcloud.io/dashboard?id=xdev-tech_star)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=xdev-tech_star&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=xdev-tech_star)


## Development

```bash
tilt up
```

The application is available at https://star.localhost

Keycloak is available at https://star.localhost/auth . The keycloak admin is `kcadmin` and the passwor is `99f194b95dbc433d2db8` in the dev environment.

```bash
tilt down
```

to shutdown the application.

Some useful command when working with certificates:

```
wget https://github.com/fullstorydev/grpcurl/releases/download/v1.8.5/grpcurl_1.8.5_linux_x86_64.tar.gz
tar xvzf grpcurl_1.8.5_linux_x86_64.tar.gz
./grpcurl -insecure peer1-hlf-peer.rte:7051 list
apk add openssl
echo | openssl s_client -connect peer1-hlf-peer.rte:7051 2>/dev/null | openssl x509 -text
./grpcurl -cacert /var/hyperledger/tls/server/cert/cacert.pem peer1-hlf-peer.rte:7051 list
openssl x509 -text -in hlf/generated/crypto-config/peerOrganizations/rte/peers/peer1.rte/tls/server.crt
```
