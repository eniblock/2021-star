FROM node:16-alpine
RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64
RUN chmod +x /usr/local/bin/dumb-init

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 9997

ENV star_1.0:f601cecdf4b22636f31fc8cf8057b297e0a736f6ab4dce68311170f38cc9d6d4=changeme
ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD sh -c "/app/node_modules/.bin/fabric-chaincode-node server --chaincode-address star.bno.star.com:9997 --chaincode-id $star_1.0:f601cecdf4b22636f31fc8cf8057b297e0a736f6ab4dce68311170f38cc9d6d4"
