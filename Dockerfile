# # # # # # # # # # # # # # # # #
#
# Build Container Definition
#
# # # # # # # # # # # # # # # # #
FROM alpine:3.18.2 AS build

# Add our node installation bin path to the global $PATH var.
ENV PATH="$PATH:/opt/node/bin"

# NodeJS depends libstdc++ to run.
RUN apk add libstdc++

# Install NodeJS as well as yarn
RUN cd /opt \
  && wget https://unofficial-builds.nodejs.org/download/release/v16.17.1/node-v16.17.1-linux-x64-musl.tar.gz -O node-v16.17.1-linux-x64-musl.tar.gz \
  && tar -xf node-v16.17.1-linux-x64-musl.tar.gz \
  && rm node-v16.17.1-linux-x64-musl.tar.gz \
  && mv node-v16.17.1-linux-x64-musl node \
  && npm i -g yarn \
  && mkdir /project

# Build directory
WORKDIR /project

# Copy over only the needed files for the build (otherwise the build context is
# measured in gigabytes and the docker build takes a _long_ time).
COPY .yarn .yarn
COPY tools tools
COPY .yarnrc.yml .yarnrc.yml
COPY nx.json nx.json
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY packages packages

ARG NODE_OPTIONS=--max-old-space-size=4096

# Build the client bundles
RUN echo "Building with NODE_OPTIONS=$NODE_OPTIONS"
RUN yarn \
    && yarn nx bundle:npm @veupathdb/clinepi-site \
    && yarn nx bundle:npm @veupathdb/genomics-site \
    && yarn nx bundle:npm @veupathdb/mbio-site \
    && yarn nx bundle:npm @veupathdb/ortho-site


# # # # # # # # # # # # # # # # #
#
# Runtime Container Definition
#
# # # # # # # # # # # # # # # # #
FROM nginx:alpine3.17-perl

# Add our node installation bin path to the global $PATH var.
ENV PATH="$PATH:/opt/node/bin"

# NodeJS depends libstdc++ to run.
RUN apk add libstdc++

# Copy over our node installation from the build image.
COPY --from=build /opt/node /opt/node

# Copy over the files we need for this image from the build context.
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker /etc/veupathdb

# Install directory for the getBundlesSubPath script.
WORKDIR /etc/veupathdb

# Build the getBundlesSubPath script.
RUN npm i -g yarn \
    && yarn install \
    && chmod +x makeSupportedBrowsersScript.js \
    && ./makeSupportedBrowsersScript.js > getBundlesSubPath \
    && chmod +x getBundlesSubPath

# File host source directory.
WORKDIR /var/www

# Important!!
#
# We flip the order of the directories here for NGINX path rewrites!
#
# clinepi/legacy  => legacy/clinepi
# genomics/modern => modern/genomics
# etc...

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
