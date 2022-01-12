FROM node:16-alpine
RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64
RUN chmod +x /usr/local/bin/dumb-init

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 9999

ENV star_1.0:25f60f13c14342962d97c4088ac0b79b046d0490b7a983d37500c9a227ea67c6=changeme
ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD sh -c "/app/node_modules/.bin/fabric-chaincode-node server --chaincode-address 0.0.0.0:9999 --chaincode-id $star_1.0:25f60f13c14342962d97c4088ac0b79b046d0490b7a983d37500c9a227ea67c6"
