## create-express-app

本项目基于 [express](https://github.com/expressjs/express) 提供开箱即用的 RESTful API 服务

## 运行

```
$  yarn
$ `yarn start`  or  `yarn dev`  or  `yarn prod`
```

> ⚠️ 开发时建议使用 yarn dev，支持热更新！️️

## 目录结构

```
+ prisma
    - schema.prisma 面向DB的 modal
+ src
    - app 应用层，主要负责功能模块的初始化与使用
        - index.ts 加载并初始化所有的功能
        - conf.ts 基于 `toml` 根据环境变量对配置文件的读取
        - log.ts 基于 `log4js` 实现日志的功能
        - prisma.ts 基于 `prisma` 实现 orm 功能
        - server.ts 基于 `express` 实现 http service 功能
    - conf 配置 通常根据环境变量区分配置
        - .dev.toml 配置示例（也可为开发时环境变量)
    - controllers 控制层，负责接收与输出 RESTful API。由 `routing-controllers` 实现
    - models 模型层，用于放置领域模型及数据类型。
    - public 公开资源，可直接通过 RESTful API 直接访问
    - service 服务层，用于处理来自控制层的逻辑
```

## 开发规范

### 介绍

- 控制层（controller）：

  1. 请求的入口，该层会声明请求的类型，解析方式，来源参数等。
  2. 在该层通常只处理地址索引与数据校验，保证数据的可用性，同时准备好向下传递数据。
  3. 文件名采用大驼峰，文件组织的方式按照功能（URL）组织。使用约定式路由，约定大于配置。

- 服务层（service）：

  1. 主要是为了解耦和封装不同场景的业务和功能到对应的服务，然而达到高度中心化的业务代码。
  2. 逻辑的密集点，是系统层的聚合层，控制层的衔接层，主要起到服务编排作用。
  3. 处理控制层以下的数据，一般是按业务从系统层组织服务，然后由控制层调用。文件名采用大驼峰，

- 系统层（system）：

  1. 业务单元点。
  2. 该层会进行任务细分，会从基础服务层得到支持，从而完成基础的单元功能，从而向服务层交付。
  3. 按照类别组织文件结构。文件名与函数名采用大驼峰及 class 写法，如果单一文件能完成，不建议拆成多文件。大的模块，例：代码管理层，建议使用文件夹组织代码。但请保证每层 `index.ts`的存在。

- 基础功能层（pkg）：
  1. 提供一系列基础服务以及第三方服务，比如 git、持久化、orm 层。
  2. 面向底层逻辑，可随意移植代替。

### Big Team

> 如果你是一个大项目/团队，严格分层设计是非常棒的。

通常一个请求，首先来到控制层校验数据，然后调用服务层。服务层根据业务将系统层中的单元功能进行聚合，从而返回给控制层。

### Entrepreneurship Team

> 对于创业团队或处于 POC 阶段的项目快速生产是主要事情。

该阶段你可以稍加压缩层次，在 controller 做稍多工作。

## Token

1. 前端请求时需将 key 为 Authorization 的 token 放入 http header 中进行请求。
2. Controller 中获取用户信息：getUserToken() 或 request.auth。

## ORM

1. ORM 采用 [prisma](https://github.com/prisma/prisma) ，你可以[快速入门](https://www.prisma.io/docs/getting-started/quickstart)进行学习。
2. 如果你修改了 `/prisma/schema.prisma` 定义文件, 可以运行 [prisma-generate](https://www.prisma.io/docs/reference/api-reference/command-reference#generate) 生成数据模型 或运行 [prisma-migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate) 迁移数据库（开发、生产）和重新生成数据模型。
3. 建议关注 [format](https://www.prisma.io/docs/reference/api-reference/command-reference#format) 、[db pull](https://www.prisma.io/docs/reference/api-reference/command-reference#db-pull) 、[db push](https://www.prisma.io/docs/reference/api-reference/command-reference#db-push) 等 cli 命令

## 感谢

- [expressjs/express](https://github.com/expressjs/express) - 快速、不拘一格、极简主义的 Web 框架。
- [prisma/prisma](https://github.com/prisma/prisma) - 开箱即用的 ORM 库。
- [log4js-node/log4js-node](https://github.com/log4js-node/log4js-node) - log4js 到 node.js 的日志库。
- [typestack/routing-controllers](https://github.com/typestack/routing-controllers) - 使用 TypeScript 和路由控制器框架在 Express / Koa 中使用大量装饰器创建结构化、声明性和组织精美的基于类的控制器。
- [typestack/class-validator](https://github.com/typestack/class-validator) - 使用基于装饰器和非装饰器的对数据校验。
