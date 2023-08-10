import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider as Provider,
  createHttpLink,
  split,
  HttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from "@apollo/client/utilities";

let httpLink = createHttpLink({
  // uri: "https://pandora-chat.onrender.com",
  uri: "http://localhost:8080",
  // uri: "http://3.145.157.17:8080",
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
    },
  };
});

httpLink = authLink.concat(httpLink);

const wsLink = new WebSocketLink({
  // uri: `wss://pandora-chat.onrender.com/graphql`,
  uri: `ws://localhost:8080/graphql`,
  // uri: `ws://3.145.157.17:8080/graphql`,
  options: {
    reconnect: true,
  },
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default function ApolloProvider(props) {
  return <Provider client={client} {...props} />;
}