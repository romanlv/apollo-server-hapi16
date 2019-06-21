import Boom from "boom";
import {
  Server,
  Request,
  RouteAdditionalConfigurationOptions,
  ReplyWithContinue,
  PluginFunction
} from "hapi";
import {
  GraphQLOptions,
  runHttpQuery,
  convertNodeHttpToRequest
} from "apollo-server-core";
import { ValueOrPromise } from "apollo-server-env";

export interface HapiOptionsFunction {
  (request?: Request): ValueOrPromise<GraphQLOptions>;
}

export interface HapiPluginOptions {
  path: string;
  vhost?: string;
  route?: RouteAdditionalConfigurationOptions;
  graphqlOptions: GraphQLOptions | HapiOptionsFunction;
}

export type IPlugin = PluginFunction<HapiPluginOptions>;

const graphqlHapi: IPlugin = (
  server: Server,
  options: HapiPluginOptions,
  next: Function
) => {
  if (!options || !options.graphqlOptions) {
    throw new Error("Apollo Server requires options.");
  }
  server.route({
    method: ["GET", "POST"],
    path: options.path || "/graphql",
    vhost: options.vhost || undefined,
    config: options.route || {},
    handler: async (request: Request, reply: ReplyWithContinue) => {
      try {
        const { graphqlResponse, responseInit } = await runHttpQuery(
          [request, reply],
          {
            method: request.method.toUpperCase(),
            options: options.graphqlOptions,
            query:
              request.method === "post"
                ? // TODO type payload as string or Record
                  (request.payload as any)
                : request.query,
            request: convertNodeHttpToRequest(request.raw.req)
          }
        );

        const response = reply(graphqlResponse);
        Object.keys(responseInit.headers).forEach(key =>
          response.header(key, responseInit.headers[key])
        );
        return response;
      } catch (error) {
        if ("HttpQueryError" !== error.name) {
          throw Boom.boomify(error);
        }

        if (true === error.isGraphQLError) {
          const response = reply(error.message);
          response.code(error.statusCode);
          response.type("application/json");
          return response;
        }

        // @ts-ignore
        const err = new Boom(error.message, { statusCode: error.statusCode });
        if (error.headers) {
          Object.keys(error.headers).forEach(header => {
            err.output.headers[header] = error.headers[header];
          });
        }
        // Boom hides the error when status code is 500
        err.output.payload.message = error.message;
        throw err;
      }
    }
  });

  if (next) {
    next();
  }
};

graphqlHapi.attributes = {
  name: "graphql"
};

export { graphqlHapi };
