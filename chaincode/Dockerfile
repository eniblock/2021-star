FROM node:16-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

COPY META-INF /META-INF

EXPOSE 9999

ENV CHAINCODE_CONNECTION_ADDRESS=changeme:9999 \
    CHAINCODE_ADDRESS=0.0.0.0:9999 \
    CHAINCODE_NAME=star \
    CHAINCODE_LABEL=star

CMD /ccid $CHAINCODE_CONNECTION_ADDRESS -l $CHAINCODE_LABEL -n $CHAINCODE_NAME -- sh -c '/app/node_modules/.bin/fabric-chaincode-node server --chaincode-address $CHAINCODE_ADDRESS --chaincode-id $CHAINCODE_ID'
