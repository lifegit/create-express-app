# docker build -t create-express-app -f Dockerfile .
# ===========================================
FROM node:16.16-slim AS sys
WORKDIR /app

RUN sed -i s@/deb.debian.org/@/mirrors.aliyun.com/@g /etc/apt/sources.list
RUN sed -i s@/security.debian.org/@/mirrors.aliyun.com/@g /etc/apt/sources.list
RUN apt-get update -y && \
  apt-get install -y openssl && \
  rm -rf /var/lib/apt/lists/*


FROM sys AS builder
WORKDIR /app

RUN yarn config set registry https://registry.npmmirror.com/
COPY package.json .
RUN yarn install --production

COPY . .
RUN yarn prisma-generate
RUN yarn build


# dist
FROM sys AS dist
WORKDIR /app

COPY --from=builder /app/dist /app/bin
COPY --from=builder /app/node_modules /app/bin/node_modules

ENV TZ Asia/Shanghai
ENV NODE_ENV production

EXPOSE 80
CMD [ "node", "/app/bin/main.js","-c","/app/conf/.prod.toml" ]
