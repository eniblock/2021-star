#!/usr/bin/env python

config.define_bool("dev-frontend")
config.define_bool("no-volumes")
cfg = config.parse()

clk_k8s = 'clk --force-color k8s -c ' + k8s_context() + ' '
load('ext://kubectl_build', 'image_build', 'kubectl_build_registry_secret',
     'kubectl_build_enable')
kubectl_build_enable(
    local(clk_k8s + 'features --field value --format plain kubectl_build'))

if config.tilt_subcommand == 'up':
  # declare the host we'll be using locally in k8s dns
  local(clk_k8s + 'add-domain star.localhost')

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
)

k8s_yaml(
    helm(
        'helm/star',
        values=['./helm/star/values-dev.yaml'],
        name='star',
    )
)

k8s_resource('star-backend', port_forwards=['5000:5000'])

local_resource('helm lint',
               'docker run --rm -t -v $PWD:/app registry.gitlab.com/xdev-tech/build/helm:2.0' +
               ' lint helm/star --values helm/star/values-dev.yaml',
               'helm/star/', allow_parallel=True)

if config.tilt_subcommand == 'down' and not cfg.get("no-volumes"):
  local(
      'kubectl --context ' + k8s_context()
      + ' delete pvc --selector=app.kubernetes.io/instance=star --wait=false'
  )



############################# hlf #############################

load('ext://namespace', 'namespace_create')
load('ext://helm_remote', 'helm_remote')

namespace_create('orderer')
namespace_create('enedis')
namespace_create('rte')
namespace_create('producteurs')

kc_secret = 'kubectl create secret --dry-run=client -o yaml '

dk_run = 'docker run --rm -u $(id -u):$(id -g) -v $PWD/hlf:/hlf hyperledger/fabric-tools:2.3 '
if not os.path.exists('./hlf/generated/crypto-config'):
    local(dk_run + ' cryptogen generate --config=/hlf/crypto-config.yaml --output=/hlf/generated/crypto-config')
if not os.path.exists('./hlf/generated/genesis.block'):
    local(dk_run + 'env FABRIC_CFG_PATH=/hlf configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock /hlf/generated/genesis.block')
if not os.path.exists('./hlf/generated/star.tx'):
    local(dk_run + 'env FABRIC_CFG_PATH=/hlf configtxgen -profile TwoOrgsChannel -outputCreateChannelTx /hlf/generated/star.tx -channelID star')


#### orderers ####

k8s_yaml(local(kc_secret + '-n orderer generic hlf--genesis --from-file=./hlf/generated/genesis.block', quiet=True))
k8s_yaml(local(kc_secret + '-n orderer generic hlf--ord-admincert --from-file=cert.pem=./hlf/generated/crypto-config/ordererOrganizations/orderer/users/Admin@orderer/msp/signcerts/Admin@orderer-cert.pem', quiet=True))
for orderer in ['orderer1', 'orderer2', 'orderer3']:
    # create secrets
    k8s_yaml(local(kc_secret + '-n orderer generic hlf--' + orderer + '-idcert --from-file=./hlf/generated/crypto-config/ordererOrganizations/orderer/orderers/' + orderer + '.orderer/msp/signcerts/' + orderer + '.orderer-cert.pem', quiet=True))
    k8s_yaml(local(kc_secret + '-n orderer generic hlf--' + orderer + '-idkey --from-file=./hlf/generated/crypto-config/ordererOrganizations/orderer/orderers/' + orderer + '.orderer/msp/keystore/priv_sk', quiet=True))
    k8s_yaml(local(kc_secret + '-n orderer generic hlf--' + orderer + '-cacert --from-file=./hlf/generated/crypto-config/ordererOrganizations/orderer/orderers/' + orderer + '.orderer/msp/cacerts/ca.orderer-cert.pem', quiet=True))
    k8s_yaml(local(kc_secret + '-n orderer tls hlf--' + orderer + '-tls --key=./hlf/generated/crypto-config/ordererOrganizations/orderer/orderers/' + orderer + '.orderer/tls/server.key --cert=./hlf/generated/crypto-config/ordererOrganizations/orderer/orderers/' + orderer + '.orderer/tls/server.crt', quiet=True))
    k8s_yaml(local(kc_secret + '-n orderer generic hlf--' + orderer + '-tlsrootcert --from-file=cacert.pem=./hlf/generated/crypto-config/ordererOrganizations/orderer/orderers/' + orderer + '.orderer/tls/ca.crt', quiet=True))

    helm_remote('hlf-ord',
        repo_url="https://gitlab.com/api/v4/projects/30449896/packages/helm/dev",
        version="0.1.0-develop.12",
        namespace='orderer',
        release_name=orderer,
        values=['helm/hlf-ord/values-' + orderer + '.yaml'],
    )

    k8s_resource(orderer + '-hlf-ord', labels=['orderer'])
    if config.tilt_subcommand == 'up':
        local(clk_k8s + 'add-domain ' + orderer + '.orderer.localhost')
    if config.tilt_subcommand == 'down' and not cfg.get("no-volumes"):
        local('kubectl --context ' + k8s_context() + ' -n orderer delete pvc --selector=app.kubernetes.io/instance=' + orderer + ' --wait=false')


#### peers ####

for org in ['enedis', 'rte', 'producteurs']:
    k8s_yaml(local(kc_secret + '-n ' + org + ' generic starchannel --from-file=./hlf/generated/star.tx', quiet=True))
    k8s_yaml(local(kc_secret + '-n ' + org + ' generic hlf--ord-tlsrootcert --from-file=cacert.pem=./hlf/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/tls/ca.crt', quiet=True))
    for peer in ['peer1', 'peer2']:
        k8s_yaml(local(kc_secret + '-n ' + org + ' generic hlf--' + peer + '-idcert --from-file=./hlf/generated/crypto-config/peerOrganizations/' + org + '/peers/' + peer + '.' + org + '/msp/signcerts/' + peer + '.' + org + '-cert.pem', quiet=True))
        k8s_yaml(local(kc_secret + '-n ' + org + ' generic hlf--' + peer + '-idkey --from-file=./hlf/generated/crypto-config/peerOrganizations/' + org + '/peers/' + peer + '.' + org + '/msp/keystore/priv_sk', quiet=True))
        k8s_yaml(local(kc_secret + '-n ' + org + ' generic hlf--' + peer + '-cacert --from-file=./hlf/generated/crypto-config/peerOrganizations/' + org + '/peers/' + peer + '.' + org + '/msp/cacerts/ca.' + org + '-cert.pem', quiet=True))

        k8s_yaml(local(kc_secret + '-n ' + org + ' tls hlf--' + peer + '-tls --key=./hlf/generated/crypto-config/peerOrganizations/' + org + '/peers/' + peer + '.' + org + '/tls/server.key --cert=./hlf/generated/crypto-config/peerOrganizations/' + org + '/peers/' + peer + '.' + org + '/tls/server.crt', quiet=True))
        k8s_yaml(local(kc_secret + '-n ' + org + ' generic hlf--' + peer + '-tlsrootcert --from-file=cacert.pem=./hlf/generated/crypto-config/peerOrganizations/' + org + '/peers/' + peer + '.' + org + '/tls/ca.crt', quiet=True))

        k8s_yaml(local(kc_secret + '-n ' + org + ' tls hlf--' + peer + '-tls-client --key=./hlf/generated/crypto-config/peerOrganizations/' + org + '/users/Admin@' + org + '/tls/client.key --cert=./hlf/generated/crypto-config/peerOrganizations/' + org + '/users/Admin@' + org + '/tls/client.crt', quiet=True))
        k8s_yaml(local(kc_secret + '-n ' + org + ' generic hlf--' + peer + '-client-tlsrootcert --from-file=./hlf/generated/crypto-config/peerOrganizations/' + org + '/users/Admin@' + org + '/tls/ca.crt', quiet=True))

        k8s_yaml(local(kc_secret + '-n ' + org + ' generic hlf--' + peer + '-admincert --from-file=cert.pem=./hlf/generated/crypto-config/peerOrganizations/' + org + '/users/Admin@' + org + '/msp/signcerts/Admin@' + org + '-cert.pem', quiet=True))
        k8s_yaml(local(kc_secret + '-n ' + org + ' generic hlf--' + peer + '-adminkey --from-file=cert.pem=./hlf/generated/crypto-config/peerOrganizations/' + org + '/users/Admin@' + org + '/msp/keystore/priv_sk', quiet=True))

        helm_remote('hlf-peer',
            repo_url="https://gitlab.com/api/v4/projects/30449896/packages/helm/dev",
            version="0.1.0-develop.12",
            namespace=org,
            release_name=peer,
            values=['helm/hlf-peer/values-' + org + '-' + peer + '.yaml'],
        )

        k8s_resource(peer + '-hlf-peer:deployment:' + org, labels=[org])
        if config.tilt_subcommand == 'up':
            local(clk_k8s + 'add-domain ' + peer + '.' + org + '.localhost')
        if config.tilt_subcommand == 'down' and not cfg.get("no-volumes"):
            local('kubectl --context ' + k8s_context() + ' -n ' + org + ' delete pvc --selector=app.kubernetes.io/instance=' + peer + ' --wait=false')
    # k8s_yaml(
    #     helm(
    #         'hlf-chaincode',
    #         namespace=org,
    #         values=['hlf-chaincode/values-dev.yaml'],
    #         name='chaincode1',
    #     )
    # )
    # k8s_resource('chaincode1-hlf-chaincode:deployment:' + org, labels=[org])
