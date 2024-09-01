FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --production --frozen-lockfile

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app .
COPY --from=prerelease /usr/src/app/package.json .

ENV TEST_SERVER_ID=953175228899553312

ENTRYPOINT [ "bun", "start" ]