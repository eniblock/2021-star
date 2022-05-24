#!/usr/bin/env python

secret_settings(disable_scrub=True)

config.define_bool("dev-frontend")
config.define_bool("no-volumes")
config.define_string("env")
config.define_string_list('orgs', args=True)
cfg = config.parse()

env = cfg.get('env', 'dev')
orgs = cfg.get('orgs', ['rte'])

clk_k8s = 'clk --force-color k8s -c ' + k8s_context() + ' '
load('ext://kubectl_build', 'image_build', 'kubectl_build_registry_secret',
     'kubectl_build_enable')
kubectl_build_enable(
    local(clk_k8s + 'features --field value --format plain kubectl_build'))

if config.tilt_subcommand == 'up':
    local(clk_k8s + 'helm-dependency-update helm/star')
# manually download the dependencies
local_resource('helm dependencies',
               clk_k8s + 'helm-dependency-update helm/star -ft Tiltfile',
               trigger_mode=TRIGGER_MODE_MANUAL, auto_init=False)

# frontend build
extra_front_opts = {}
if cfg.get('dev-frontend'):
    extra_front_opts.update(dict(
        target='dev',
        live_update=[
            sync('frontend', '/usr/src/app'),
            run('cd /usr/src/app && npm ci',
                trigger=['./package.json', './package.lock']),
        ]
    ))
image_build(
    'registry.gitlab.com/xdev-tech/star/frontend',
    'frontend',
    **extra_front_opts
)

# backend build
image_build(
    'registry.gitlab.com/xdev-tech/star/backend',
    'backend',
    target='dev'
)

# keycloak build
image_build(
    'registry.gitlab.com/xdev-tech/star/keycloak',
    'keycloak',
    live_update=[
        sync('keycloak/configurator/', '/tf/'),
        # sync('keycloak/themes/base/login/', '/opt/keycloak/themes/base/login/'),
        sync('keycloak/theme/custom-theme', '/opt/keycloak/themes/extra/'),
    ]
)

# org instances

for org in orgs:
    if config.tilt_subcommand == 'up':
        # declare the host we'll be using locally in k8s dns
        local(clk_k8s + 'add-domain ' + org + '.localhost')

    k8s_yaml(
        helm(
            'helm/star',
            values=['./helm/star/values-' + org + '-' + env + '.yaml'],
            name='star',
            namespace=org
        )
    )

    #
    if len(orgs) == 1:
        k8s_resource('star-backend', labels=[org], port_forwards="5005:5005")
        k8s_resource('star-maildev', labels=[org], port_forwards="1080:80")
        k8s_resource('star-frontend', labels=[org])
        k8s_resource('star-keycloak', labels=[org])
        k8s_resource('star-keycloak-db', labels=[org])
    else:
        k8s_resource('star-backend:deployment:' + org, labels=[org])
        k8s_resource('star-maildev:deployment:' + org, labels=[org])
        k8s_resource('star-frontend:deployment:' + org, labels=[org])
        k8s_resource('star-keycloak:statefulset:' + org, labels=[org])
        k8s_resource('star-keycloak-db:statefulset:' + org, labels=[org])

    if config.tilt_subcommand == 'down' and not cfg.get("no-volumes"):
        local(
            'kubectl --context ' + k8s_context()
            + ' delete pvc --selector=app.kubernetes.io/instance=star --namespace ' + org + ' --wait=false'
        )

local_resource('helm lint',
            'docker run --rm -t -v $PWD:/app registry.gitlab.com/xdev-tech/build/helm:3.1' +
            ' lint star helm/star --values helm/star/values-rte-' + env + '.yaml',
            'helm/star/', allow_parallel=True)


############################# hlf #############################

# image build
image_build(
    'registry.gitlab.com/xdev-tech/star/chaincode',
    'chaincode',
)

load('ext://namespace', 'namespace_create')
load('ext://helm_remote', 'helm_remote')

namespace_create('orderer')
namespace_create('enedis')
namespace_create('rte')
namespace_create('producer')

kc_secret = 'kubectl create secret --dry-run=client -o yaml '

dk_run = 'docker run --rm -u $(id -u):$(id -g) -v $PWD/hlf/' + env + ':/hlf/' + env + ' hyperledger/fabric-tools:2.3 '
if not os.path.exists('./hlf/' + env + '/generated/crypto-config'):
    local(dk_run + ' cryptogen generate --config=/hlf/' + env + '/crypto-config.yaml --output=/hlf/' + env + '/generated/crypto-config')
if not os.path.exists('./hlf/' + env + '/generated/genesis.block'):
    local(dk_run + 'env FABRIC_CFG_PATH=/hlf/' + env + ' configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock /hlf/' + env + '/generated/genesis.block')
if not os.path.exists('./hlf/' + env + '/generated/star.tx'):
    local(dk_run + 'env FABRIC_CFG_PATH=/hlf/' + env + ' configtxgen -profile TwoOrgsChannel -outputCreateChannelTx /hlf/' + env + '/generated/star.tx -channelID star')


#### orderers ####

k8s_yaml(local(kc_secret + '-n orderer generic hlf--genesis --from-file=./hlf/' + env + '/generated/genesis.block', quiet=True))
k8s_yaml(local(kc_secret + '-n orderer generic hlf--ord-admincert --from-file=cert.pem=./hlf/' + env + '/generated/crypto-config/ordererOrganizations/orderer/users/Admin@orderer/msp/signcerts/Admin@orderer-cert.pem', quiet=True))
for orderer in ['orderer1', 'orderer2', 'orderer3']:
    # create secrets
    k8s_yaml(local(kc_secret + '-n orderer generic hlf--' + orderer + '-idcert --from-file=./hlf/' + env + '/generated/crypto-config/ordererOrganizations/orderer/orderers/' + orderer + '.orderer/msp/signcerts/' + orderer + '.orderer-cert.pem', quiet=True))
    k8s_yaml(local(kc_secret + '-n orderer generic hlf--' + orderer + '-idkey --from-file=./hlf/' + env + '/generated/crypto-config/ordererOrganizations/orderer/orderers/' + orderer + '.orderer/msp/keystore/priv_sk', quiet=True))
    k8s_yaml(local(kc_secret + '-n orderer generic hlf--' + orderer + '-cacert --from-file=./hlf/' + env + '/generated/crypto-config/ordererOrganizations/orderer/orderers/' + orderer + '.orderer/msp/cacerts/ca.orderer-cert.pem', quiet=True))
    k8s_yaml(local(kc_secret + '-n orderer tls hlf--' + orderer + '-tls --key=./hlf/' + env + '/generated/crypto-config/ordererOrganizations/orderer/orderers/' + orderer + '.orderer/tls/server.key --cert=./hlf/' + env + '/generated/crypto-config/ordererOrganizations/orderer/orderers/' + orderer + '.orderer/tls/server.crt', quiet=True))
    k8s_yaml(local(kc_secret + '-n orderer generic hlf--' + orderer + '-tlsrootcert --from-file=cacert.pem=./hlf/' + env + '/generated/crypto-config/ordererOrganizations/orderer/orderers/' + orderer + '.orderer/tls/ca.crt', quiet=True))

    helm_remote('hlf-ord',
        repo_url="https://gitlab.com/api/v4/projects/30449896/packages/helm/dev",
        version="0.1.0-develop.37",
        namespace='orderer',
        release_name=orderer,
        values=['helm/hlf-ord/values-orderer-' + env + '-' + orderer + '.yaml'],
    )

    k8s_resource(orderer + '-hlf-ord', labels=['orderer'])
    if config.tilt_subcommand == 'up':
        local(clk_k8s + 'add-domain ' + orderer + '.orderer.localhost')
    if config.tilt_subcommand == 'down' and not cfg.get("no-volumes"):
        local('kubectl --context ' + k8s_context() + ' -n orderer delete pvc --selector=app.kubernetes.io/instance=' + orderer + ' --wait=false')


#### peers ####

for org in ['enedis', 'rte', 'producer']:
    local('./hlf/dev/ccp-generate.sh ' + org)
    local('./hlf/dev/user-generate.sh ' + org)
    k8s_yaml(local(kc_secret + '-n ' + org + ' generic star-peer-connection --from-file=connection.yaml=./hlf/' + env + '/generated/crypto-config/peerOrganizations/' + org + '/connection-' + org + '.yaml', quiet=True))
    k8s_yaml(local(kc_secret + '-n ' + org + ' generic star-user-id --from-file=User1.id=./hlf/' + env + '/generated/crypto-config/peerOrganizations/' + org + '/User1.id', quiet=True))
    k8s_yaml(local(kc_secret + '-n ' + org + ' generic starchannel --from-file=./hlf/' + env + '/generated/star.tx', quiet=True))
    k8s_yaml(local(kc_secret + '-n ' + org + ' generic hlf--ord-tlsrootcert --from-file=cacert.pem=./hlf/' + env + '/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/tls/ca.crt', quiet=True))
    for peer in ['peer1']:
        k8s_yaml(local(kc_secret + '-n ' + org + ' generic hlf--' + peer + '-idcert --from-file=./hlf/' + env + '/generated/crypto-config/peerOrganizations/' + org + '/peers/' + peer + '.' + org + '/msp/signcerts/' + peer + '.' + org + '-cert.pem', quiet=True))
        k8s_yaml(local(kc_secret + '-n ' + org + ' generic hlf--' + peer + '-idkey --from-file=./hlf/' + env + '/generated/crypto-config/peerOrganizations/' + org + '/peers/' + peer + '.' + org + '/msp/keystore/priv_sk', quiet=True))
        k8s_yaml(local(kc_secret + '-n ' + org + ' generic hlf--' + peer + '-cacert --from-file=./hlf/' + env + '/generated/crypto-config/peerOrganizations/' + org + '/peers/' + peer + '.' + org + '/msp/cacerts/ca.' + org + '-cert.pem', quiet=True))

        k8s_yaml(local(kc_secret + '-n ' + org + ' tls hlf--' + peer + '-tls --key=./hlf/' + env + '/generated/crypto-config/peerOrganizations/' + org + '/peers/' + peer + '.' + org + '/tls/server.key --cert=./hlf/' + env + '/generated/crypto-config/peerOrganizations/' + org + '/peers/' + peer + '.' + org + '/tls/server.crt', quiet=True))
        k8s_yaml(local(kc_secret + '-n ' + org + ' generic hlf--' + peer + '-tlsrootcert --from-file=cacert.pem=./hlf/' + env + '/generated/crypto-config/peerOrganizations/' + org + '/peers/' + peer + '.' + org + '/tls/ca.crt', quiet=True))

        k8s_yaml(local(kc_secret + '-n ' + org + ' tls hlf--' + peer + '-tls-client --key=./hlf/' + env + '/generated/crypto-config/peerOrganizations/' + org + '/users/Admin@' + org + '/tls/client.key --cert=./hlf/' + env + '/generated/crypto-config/peerOrganizations/' + org + '/users/Admin@' + org + '/tls/client.crt', quiet=True))
        k8s_yaml(local(kc_secret + '-n ' + org + ' generic hlf--' + peer + '-client-tlsrootcert --from-file=./hlf/' + env + '/generated/crypto-config/peerOrganizations/' + org + '/users/Admin@' + org + '/tls/ca.crt', quiet=True))

        k8s_yaml(local(kc_secret + '-n ' + org + ' generic hlf--' + peer + '-admincert --from-file=cert.pem=./hlf/' + env + '/generated/crypto-config/peerOrganizations/' + org + '/users/Admin@' + org + '/msp/signcerts/Admin@' + org + '-cert.pem', quiet=True))
        k8s_yaml(local(kc_secret + '-n ' + org + ' generic hlf--' + peer + '-adminkey --from-file=cert.pem=./hlf/' + env + '/generated/crypto-config/peerOrganizations/' + org + '/users/Admin@' + org + '/msp/keystore/priv_sk', quiet=True))

        helm_remote('hlf-peer',
            repo_url="https://gitlab.com/api/v4/projects/30449896/packages/helm/dev",
            version="0.1.0-develop.37",
            namespace=org,
            release_name=peer,
            values=['helm/hlf-peer/values-' + org + '-' + env + '-' + peer + '.yaml'],
        )

        k8s_resource(peer + '-hlf-peer:deployment:' + org, labels=[org])
        k8s_resource(peer + '-hlf-peer-couchdb:statefulset:' + org, labels=[org])
        k8s_resource(peer + '-hlf-peer-star:deployment:' + org, labels=[org])
        k8s_resource(peer + '-hlf-peer-jc-star:job:' + org, labels=[org])
        k8s_resource(peer + '-hlf-peer-rc-star:job:' + org, labels=[org])

        if config.tilt_subcommand == 'up':
            local(clk_k8s + 'add-domain ' + peer + '.' + org + '.localhost')
        if config.tilt_subcommand == 'down' and not cfg.get("no-volumes"):
            local('kubectl --context ' + k8s_context() + ' -n ' + org + ' delete pvc --selector=app.kubernetes.io/instance=' + peer + ' --wait=false')
