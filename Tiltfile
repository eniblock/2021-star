#!/usr/bin/env python

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
