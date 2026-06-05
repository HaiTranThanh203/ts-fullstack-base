<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```



## Architecture


```bash

src/
├── domain/                    ← Lõi nghiệp vụ (không import gì ngoài)
│   ├── entities/
│   │   └── user.entity.ts
│   ├── value-objects/
│   │   └── email.vo.ts
│   ├── repositories/          ← Interface (abstract)
│   │   └── user.repository.ts
│   └── exceptions/
│       └── user-not-found.exception.ts
│
├── application/               ← Điều phối use-cases
│   ├── use-cases/
│   │   ├── create-user.use-case.ts
│   │   └── get-user.use-case.ts
│   ├── dtos/
│   │   └── create-user.dto.ts
│   ├── ports/                 ← Interface cho service bên ngoài
│   │   └── mail.port.ts
│   └── mappers/
│       └── user.mapper.ts
│
├── infrastructure/            ← Chi tiết kỹ thuật (DB, email, S3...)
│   ├── database/
│   │   ├── entities/          ← TypeORM entity (khác domain entity)
│   │   └── migrations/
│   ├── repositories/          ← Implement interface từ domain
│   │   └── user.repository.impl.ts
│   ├── services/
│   │   └── mail.service.ts    ← Implement mail.port.ts
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   └── config/
│       └── database.config.ts
│
├── presentation/              ← Giao tiếp HTTP / GraphQL / Queue
│   ├── controllers/
│   │   └── user.controller.ts
│   ├── resolvers/             ← Nếu dùng GraphQL
│   ├── consumers/             ← Kafka / RabbitMQ handlers
│   ├── validators/
│   └── presenters/            ← Format response
│
├── shared/                    ← Dùng chung, không thuộc layer nào
│   ├── constants/
│   ├── decorators/
│   ├── types/
│   ├── utils/
│   └── events/
│
├── app.module.ts
└── main.ts
```