FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma
COPY yarn.lock ./

RUN ["yarn", "install"]

COPY . .

RUN ["yarn", "build"]

CMD ["yarn", "start"]