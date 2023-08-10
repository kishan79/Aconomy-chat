const { ApolloServer } = require("apollo-server");

const resolvers = require("./graphql/resolvers");
const typeDefs = require("./graphql/typeDefs");
const contextMiddleware = require("./util/contextMiddleware");
const connectDB = require("./config/db");

require("dotenv").config();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: contextMiddleware,
  // subscriptions: { path: '/' },
  cors: {
    origin: "*",
  },
});

server.listen({port:8080}).then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(`🚀 Susbscription ready at ${subscriptionsUrl}`);

  connectDB();
});
