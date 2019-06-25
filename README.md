---
title: Hapi
description: Setting up Apollo Server with Hapi16
---

Offical repo [only supports Hapi v16 with Appolo v1](https://www.apollographql.com/docs/apollo-server/v1/servers/hapi/#hapi-16), this package uses newer Apollo (2.6.3) with hapi@16

This is the Hapi integration of Apollo Server. Apollo Server is a community-maintained open-source Apollo Server that works with many Node.js HTTP server frameworks. [Read the docs](https://www.apollographql.com/docs/apollo-server/). [Read the CHANGELOG.](https://github.com/apollographql/apollo-server/blob/master/CHANGELOG.md)

```shell
npm install apollo-server-hapi16
```

## Usage

The code below works with Hapi 16.

```js
const { ApolloServer, gql } = require('apollo-server-hapi16');
const Hapi = require('hapi');

async function StartServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  const app = new Hapi.server({
    port: 4000
  });

  await server.applyMiddleware({
    app,
  });

  await server.installSubscriptionHandlers(app.listener);

  await app.start();
}

StartServer().catch(error => console.log(error));
```

### Context

The context is created for each request. The following code snippet shows the creation of a context. The arguments are the `request`, the request, and `h`, the response toolkit.

```js
new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ request, h }) => {
    return { ... };
  },
})
```

## Principles

Apollo Server is built with the following principles in mind:

* **By the community, for the community**: Apollo Server's development is driven by the needs of developers
* **Simplicity**: by keeping things simple, Apollo Server is easier to use, easier to contribute to, and more secure
* **Performance**: Apollo Server is well-tested and production-ready - no modifications needed

Anyone is welcome to contribute to Apollo Server, just read [CONTRIBUTING.md](https://github.com/apollographql/apollo-server/blob/master/CONTRIBUTING.md), take a look at the [roadmap](https://github.com/apollographql/apollo-server/blob/master/ROADMAP.md) and make your first PR!
