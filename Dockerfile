FROM alpine:3.18.2 AS build

ENV PATH="$PATH:/opt/node/bin"

RUN apk add libstdc++

RUN cd /opt \
  && wget https://unofficial-builds.nodejs.org/download/release/v16.17.1/node-v16.17.1-linux-x64-musl.tar.gz -O node-v16.17.1-linux-x64-musl.tar.gz \
  && tar -xf node-v16.17.1-linux-x64-musl.tar.gz \
  && rm node-v16.17.1-linux-x64-musl.tar.gz \
  && mv node-v16.17.1-linux-x64-musl node \
  && npm i -g yarn \
  && mkdir /project

WORKDIR /project

COPY .yarn .yarn
COPY tools tools
COPY .yarnrc.yml .yarnrc.yml
COPY nx.json nx.json
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY packages packages

RUN yarn \
    && yarn nx bundle:npm @veupathdb/clinepi-site \
    && yarn nx bundle:npm @veupathdb/genomics-site \
    && yarn nx bundle:npm @veupathdb/mbio-site \
    && yarn nx bundle:npm @veupathdb/ortho-site


FROM nginx:alpine3.17-perl

ENV PATH="$PATH:/opt/node/bin"

RUN apk add libstdc++

COPY --from=build /opt/node /opt/node

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker /etc/veupathdb

WORKDIR /etc/veupathdb

RUN npm i -g yarn \
    && yarn install \
    && chmod +x makeSupportedBrowsersScript.js \
    && ./makeSupportedBrowsersScript.js > getBundlesSubPath \
    && chmod +x getBundlesSubPath

WORKDIR /var/www

#
# Important!!
#
# We shuffle the order of the directories here for NGINX path rewrites!
#

# Clinepi
COPY --from=build /project/node_modules/@veupathdb/clinepi-site/dist/bundles/legacy legacy/clinepi/
COPY --from=build /project/node_modules/@veupathdb/clinepi-site/dist/bundles/modern modern/clinepi/

# Genomics
COPY --from=build /project/node_modules/@veupathdb/genomics-site/dist/bundles/legacy legacy/genomics/
COPY --from=build /project/node_modules/@veupathdb/genomics-site/dist/bundles/modern modern/genomics/

# MBio
COPY --from=build /project/node_modules/@veupathdb/mbio-site/dist/bundles/legacy legacy/mbio/
COPY --from=build /project/node_modules/@veupathdb/mbio-site/dist/bundles/modern modern/mbio/

# Ortho
COPY --from=build /project/node_modules/@veupathdb/ortho-site/dist/bundles/legacy legacy/ortho/
COPY --from=build /project/node_modules/@veupathdb/ortho-site/dist/bundles/modern modern/ortho/
