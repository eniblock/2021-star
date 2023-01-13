# STAR (Smart Traceability of the Activations of Renewable generation flexibilities)

![GitHub Actions CI](https://github.com/eniblock/2021-star/actions/workflows/ci.yml/badge.svg)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=eniblock_2021-star&metric=bugs)](https://sonarcloud.io/dashboard?id=eniblock_2021-star)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=eniblock_2021-star&metric=code_smells)](https://sonarcloud.io/dashboard?id=eniblock_2021-star)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=eniblock_2021-star&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=eniblock_2021-star)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=eniblock_2021-star&metric=ncloc)](https://sonarcloud.io/dashboard?id=eniblock_2021-star)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=eniblock_2021-star&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=eniblock_2021-star)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=eniblock_2021-star&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=eniblock_2021-star)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=eniblock_2021-star&metric=security_rating)](https://sonarcloud.io/dashboard?id=eniblock_2021-star)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=eniblock_2021-star&metric=sqale_index)](https://sonarcloud.io/dashboard?id=eniblock_2021-star)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=eniblock_2021-star&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=eniblock_2021-star)


## Development

### Kubernetes/helm setup

We use kubernetes to host the application in all our environments, including the dev environment.

On the dev environment, we use `clk k8s` to install the required dependencies both on the dev host and in the local cluster.

To install `clk k8s` and create a local cluster, just run these commands:

```bash
curl -sSL https://clk-project.org/install.sh | env CLK_EXTENSIONS=k8s bash
clk k8s flow
```

### Running the application

Run tilt with:

```bash
tilt up
```

Tilt:

* generate the hyperledger fabric configuration
* builds the docker images of the application
* instantiates the kuberentes resources of the appliaction

Once done, the application is available at https://rte.localhost

Keycloak is available at https://rte.localhost/auth . The keycloak admin is `kcadmin` and the password is `99f194b95dbc433d2db8` in the dev environment.

By default, the HLF resources of the 3 organizations are created, but not the backend and frontend resources — only the resources for RTE are.
The name of the organizations can be passed to tilt to choose the organizations to instantiate.

```bash
tilt up -- enedis
```

starts only the enedis backend and frontend.

```bash
tilt up -- enedis producer rte
```

starts the backend and frontend for the 3 organizations.

### Shuting down the application

```bash
tilt down
```

to shutdown the application.

### Useful command when working with certificates

```
wget https://github.com/fullstorydev/grpcurl/releases/download/v1.8.5/grpcurl_1.8.5_linux_x86_64.tar.gz
tar xvzf grpcurl_1.8.5_linux_x86_64.tar.gz
./grpcurl -insecure peer1-hlf-peer.rte:7051 list
apk add openssl
echo | openssl s_client -connect peer1-hlf-peer.rte:7051 2>/dev/null | openssl x509 -text
./grpcurl -cacert /var/hyperledger/tls/server/cert/cacert.pem peer1-hlf-peer.rte:7051 list
openssl x509 -text -in hlf/generated/crypto-config/peerOrganizations/rte/peers/peer1.rte/tls/server.crt
```

# Deployed environments

## testing

https://enedis.testing.star.eniblock.fr/

https://producer.testing.star.eniblock.fr/

https://rte.testing.star.eniblock.fr/

## staging


https://enedis.staging.star.eniblock.fr/

https://producer.staging.star.eniblock.fr/

https://rte.staging.star.eniblock.fr/


# Making a release a production

Each release is production must be tagged. The CI checks that the tag and the version number in the `Chart.yaml` file
are exactly the same, so first make sure `Chart.yaml` contains the expected version.

Then create a tag, normally on the `staging` branch

~~~
git checkout staging
# check the version in ./helm/star/Chart.yaml
git tag -m 1.2.1 1.2.1
git push --tag
~~~

Once the artifact are ready, trigger a deployment on the production environments by merging the tag in the `prod`.

~~~
git checkout prod
git merge --ff-only 1.2.1
git push
~~~

Make sure a reviewer is accepting the deployment in github actions.

Finally, bump the version number in `Chart.yaml` to the next expected version.

