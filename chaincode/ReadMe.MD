# Chaincode Specification
## folder structure

tree star/chaincode
.
├── coverage
│   ├── base.css
│   ├── block-navigation.js
│   ├── chaincode
│   │   ├── ActivationDocument.spec.ts.html
│   │   ├── EnergyAccount.spec.ts.html
│   │   ├── EnergyAmount.spec.ts.html
│   │   ├── index.html
│   │   ├── Producer.spec.ts.html
│   │   ├── ReferenceEnergyAccount.spec.ts.html
│   │   ├── Site.spec.ts.html
│   │   ├── sonarqube-scanner.js.html
│   │   ├── src
│   │   │   ├── controller
│   │   │   │   ├── ActivationDocumentController.ts.html
│   │   │   │   ├── EnergyAccountController.ts.html
│   │   │   │   ├── EnergyAmountController.ts.html
│   │   │   │   ├── index.html
│   │   │   │   ├── ProducerController.ts.html
│   │   │   │   ├── ReferenceEnergyAccountController.ts.html
│   │   │   │   ├── SiteController.ts.html
│   │   │   │   ├── SystemOperatorController.ts.html
│   │   │   │   ├── ViewMarketParticipantController.ts.html
│   │   │   │   └── YellowPagesController.ts.html
│   │   │   ├── enums
│   │   │   │   ├── index.html
│   │   │   │   ├── MesurementUnitType.ts.html
│   │   │   │   └── OrganizationMspType.ts.html
│   │   │   ├── index.html
│   │   │   ├── index.ts.html
│   │   │   ├── model
│   │   │   │   ├── activationDocument.ts.html
│   │   │   │   ├── energyAccount.ts.html
│   │   │   │   ├── energyAmount.ts.html
│   │   │   │   ├── index.html
│   │   │   │   ├── producer.ts.html
│   │   │   │   ├── site.ts.html
│   │   │   │   ├── systemOperator.ts.html
│   │   │   │   └── yellowPages.ts.html
│   │   │   └── star.ts.html
│   │   ├── SystemOperator.spec.ts.html
│   │   ├── test
│   │   │   ├── ActivationDocument.spec.ts.html
│   │   │   ├── EnergyAccount.spec.ts.html
│   │   │   ├── EnergyAmount.spec.ts.html
│   │   │   ├── index.html
│   │   │   ├── Producer.spec.ts.html
│   │   │   ├── ReferenceEnergyAccount.spec.ts.html
│   │   │   ├── Site.spec.ts.html
│   │   │   ├── SystemOperator.spec.ts.html
│   │   │   ├── ViewMarketParticipant.spec.ts.html
│   │   │   └── YellowPages.spec.ts.html
│   │   ├── ViewMarketParticipant.spec.ts.html
│   │   └── YellowPages.spec.ts.html
│   ├── index.html
│   ├── prettify.css
│   ├── prettify.js
│   ├── sort-arrow-sprite.png
│   ├── sorter.js
│   ├── src
│   │   ├── controller
│   │   │   ├── ActivationDocumentController.ts.html
│   │   │   ├── EnergyAccountController.ts.html
│   │   │   ├── EnergyAmountController.ts.html
│   │   │   ├── index.html
│   │   │   ├── ProducerController.ts.html
│   │   │   ├── ReferenceEnergyAccountController.ts.html
│   │   │   ├── SiteController.ts.html
│   │   │   ├── SystemOperatorController.ts.html
│   │   │   ├── ViewMarketParticipantController.ts.html
│   │   │   └── YellowPagesController.ts.html
│   │   ├── enums
│   │   │   ├── index.html
│   │   │   ├── MesurementUnitType.ts.html
│   │   │   └── OrganizationMspType.ts.html
│   │   ├── index.html
│   │   ├── index.ts.html
│   │   ├── model
│   │   │   ├── activationDocument.ts.html
│   │   │   ├── energyAccount.ts.html
│   │   │   ├── energyAmount.ts.html
│   │   │   ├── index.html
│   │   │   ├── producer.ts.html
│   │   │   ├── site.ts.html
│   │   │   ├── systemOperator.ts.html
│   │   │   └── yellowPages.ts.html
│   │   └── star.ts.html
│   └── test
│       ├── ActivationDocument.spec.ts.html
│       ├── EnergyAccount.spec.ts.html
│       ├── EnergyAmount.spec.ts.html
│       ├── index.html
│       ├── Producer.spec.ts.html
│       ├── ReferenceEnergyAccount.spec.ts.html
│       ├── Site.spec.ts.html
│       ├── SystemOperator.spec.ts.html
│       ├── ViewMarketParticipant.spec.ts.html
│       └── YellowPages.spec.ts.html
├── docker-compose.yml
├── Dockerfile
├── META-INF
│   └── statedb
│       └── couchdb
│           └── indexes
│               └── indexOwner.json
├── package.json
├── package-lock.json
├── src
│   ├── controller
│   │   ├── ActivationDocumentController.ts
│   │   ├── EnergyAccountController.ts
│   │   ├── EnergyAmountController.ts
│   │   ├── ProducerController.ts
│   │   ├── ReferenceEnergyAccountController.ts
│   │   ├── SiteController.ts
│   │   ├── SystemOperatorController.ts
│   │   ├── ViewMarketParticipantController.ts
│   │   └── YellowPagesController.ts
│   ├── enums
│   │   ├── MesurementUnitType.ts
│   │   └── OrganizationMspType.ts
│   ├── model
│   │   ├── activationDocument.ts
│   │   ├── energyAccount.ts
│   │   ├── energyAmount.ts
│   │   ├── producer.ts
│   │   ├── restitution.json
│   │   ├── site.ts
│   │   ├── systemOperator.ts
│   │   ├── viewMarketParticipant.ts
│   │   ├── yellowPage.json
│   │   └── yellowPages.ts
│   └── star.ts
├── test
│   ├── ActivationDocument.spec.ts
│   ├── EnergyAccount.spec.ts
│   ├── EnergyAmount.spec.ts
│   ├── Producer.spec.ts
│   ├── ReferenceEnergyAccount.spec.ts
│   ├── Site.spec.ts
│   ├── SystemOperator.spec.ts
│   ├── ViewMarketParticipant.spec.ts
│   └── YellowPages.spec.ts
├── tsconfig.json
└── tslint.json

22 directories, 129 files

## coverage folder

for coverage purpose, open thi file on your browser
file:///home/zhasni/XDEV/star/chaincode/coverage/index.html

## docker-compose.yaml file

for sonarqube, tou launch execute :
```
docker-compose up -d
```

## Dockerfile file

template to launch chaincode as an external chaincode imperative for K8s environnement.

## META-INF folder

needed fo indexes (or to set private data collections)
there's an example in `statedb/couchdb/indexes/indexOwner.json`
TODO Finalize all the index needed to all rich queries -> check with ERIC LEGBA
TODO add the folder META-INF in code.tar.gz archive for external chaincode in K8s -> check with GAËTAN LEHMANN

## package.json and package-lock.json

for ts purposes check inside the files

for example
```bash
# to build
npm run build
```
output -> a dist folder with TS files compiled in JS

```bash
# to test
npm run test
...
```
output -> a coverage folder

## src folder
where the actual chaincode is

## controller folder
All controllers files with business rules embedded


### ActivationDocumentController.ts
rules for "ordres", 5 methods (3 public, 2 private)

``` bash
# to write
    public static async createActivationDocument

# to read (producer scope)
    public static async getActivationDocumentByProducer

# to read (operator scope)
    public static async getActivationDocumentBySystemOperator

# to reconcile begin/begin orders
    private static async checkForReconciliationBB

# to reconcile begin/end orders
    private static async checkForReconciliationBE
```

### EnergyAccountController.ts
rules for "courbe de comptages" 3 publics methods

```bash
# to write
    public static async createEnergyAccount

# to read (operator scope)
    public static async getEnergyAccountForSystemOperator

# to read (producer scope)
    public static async getEnergyAccountByProducer
```

### EnergyAmountController.ts
rules for "courbe de ???" (j'ai oublié en français) 4 publics methods

```bash
# to write (transportor scope)
    public static async createTSOEnergyAmount

# to write (distributor scope)
    public static async createDSOEnergyAmount

# to read
    public static async getEnergyAmountForSystemOperator

# to read (producer scope)
    public static async getEnergyAmountByProducer
```

### ProducerController.ts
rules for "producteurs market participants" 4 publics methods
```bash
# to write
    public static async createProducer

# to read (producer scope)
    public static async queryProducer

# to update useless if remove check if exist on write (but it was on the US...)
    public static async updateProducer

# to read (operator scope)
    public static async getAllProducer
```

### ReferenceEnergyAccountController.ts
rules for "courbe de references" 3 publics methods

```bash
# to write
    public static async createReferenceEnergyAccount

# to read (operator scope)
    public static async getReferenceEnergyAccountForSystemOperator

# to read (producer scope)
    public static async getReferenceEnergyAccountByProducer
```

### SiteController.ts
rules for "site de production HTA et HTA" 4 publics methods

```bash
# to write
    public static async createSite

# to read one designated site
    public static async querySite

# to read (operator scope)
    public static async getSitesBySystemOperator

# to read (producer scope)
    public static async getSitesByProducer
```

### SystemOperatorController.ts
rules for "system operator market participants" 4 publics methods

```bash
# to write
    public static async createSystemOperator

# to read one
    public static async querySystemOperator

# to update useless if remove check if exist on write (but it was on the US...)
    public static async updateSystemOperator

# to read (operator scope)
    public static async getAllSystemOperator
```

### ViewMarketParticipantController.ts
rules for "restitiution des market participants en fonction de la matrice de droits" 2 publics methods

```bash
# to read (operator scope)
    public static async viewSystemOperaterMarketParticipant

# to read (producer scope)
    public static async viewProducerMarketParticipant
```

### YellowPagesController.ts
rules for "l'objet indispensable pour la resitution qui n'apparait dans aucunes US et qui change tout le temps ^^"
mapping entre l'appelation RTE et le l'appelation ENEDIS pour les ordres (site/leviers)
```bash
# to write
    public static async createYellowPages

# to read all
    public static async getAllYellowPages
```
## enums folder

### MesurementUnitType.ts
unit megawatt = MW and kilowatt = KW

### OrganizationMspType.ts
MSPIDs of the 3 organizations RTE, ENEDIS, and PRODUCERS BNO (which is RTE/ENEDIS)

## model folder
class declarations with a schema to check optional and mandatory files, format verifications etc...

## star.ts file
main file

## test folder
unit test since the no more mock stub in V2.0 I had to make a mock states and fake functions to simulate a real ledger BDDs etc...

1 file for each controllers

## tsconfig.json and tslint.json
config for ts and lint.
