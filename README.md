# Picker Create Creative

采撷、创造、创意

```
pnpm watch:all
pnpm dev-server:start
```
# 创建你的数字工作室
一款为创业者打造的工作室系统

帮助构建专属的工作室服务平台，快速整合资源为用户提供内容服务。 采用 TypeScript & Nodejs 构建，api 基于graphql语言编写

Picker 内容管理系统文档
注:Picker 内容框架系统目前处于测试阶段，因此，这里记录的信息和api可能会发生变化。

什么是 Picker
Picker 的基础是一个无头Headless的内容管理框架， 术语定义

Headless 是一个术语，它不关心网站的 HTML 页面渲染。它公开了一个 GraphQL API，可通过客户端应用程序查询数据 (如查询课程列表) 或通过 Mutation (添加一个视频资源到当前的课程目录)。客户端负责工作室系统的外观和交互模式。剩下的者由 Picker 系统负责。
Picker 是一个框架，因为它提供核心的内容资源管理功能，开放扩展能力，可供使用这个框架的用户进行拓展
默认产品将会涵盖但不仅限于：

内容创作 支持任何形式的创作，包括：图文、代码、绘画、游戏、视频、音乐、资料、素材等
内容付费
课程 支持视频学习的内容版块建设
资源库 一个资源导航版块，可放置一些开放资源导航
作品 作品集管理
社区功能
谁应该使用 Picker
Picker 目的是希望帮助独立创业者、内容创作者提供一套完整的内容管理系统。 虽然我们的目标是提供开箱即用的产品和容易的开发体验，但 Picker 当前主要还是针对有一定技术能力的用户。

使用的技术
Picker 是建立在什么技术上的?

Picker 的开发语言是 Typescript
Node.js 是它的运行平台
数据层使用 MikrOrm，它是一个基于数据映射、工作单元以及映射的 Typescript ORM
底层架构采用 Nest
API 层由 Apollo 服务支持的 GraphQL 编写
Admin UI 应用程序由 Angular、VUE构建
