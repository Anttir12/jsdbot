FROM node:22-slim

RUN mkdir /app
WORKDIR /app
ENV TZ=UTC
RUN apt-get update && apt-get install -y ffmpeg

ADD . /app/

RUN corepack enable \
    && corepack prepare pnpm@10.15.0 --activate

RUN pnpm install --force
RUN pnpm build