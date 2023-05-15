const userResolvers = require("./users");
const messageResolvers = require("./messages");
const friendResolvers = require("./friends");

module.exports = {
  Message: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  Query: {
    ...userResolvers.Query,
    ...messageResolvers.Query,
    ...friendResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...messageResolvers.Mutation,
    ...friendResolvers.Mutation,
  },
  Subscription: {
    ...messageResolvers.Subscription,
  },
};
