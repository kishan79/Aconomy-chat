const {
  UserInputError,
  AuthenticationError,
  // withFilter,
} = require("apollo-server");
const { withFilter } = require("graphql-subscriptions");
const MessageModel = require("../../models/Message");


module.exports = {
  Query: {
    getMessages: async (parent, { from }, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        const walletAddresses = [user.wallet_address, from];

        const messages = await MessageModel.find({
          from: { $in: walletAddresses },
          to: { $in: walletAddresses },
        }).sort({ createdAt: -1 });

        return messages;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Mutation: {
    sendMessage: async (parent, { to, content }, { user, pubsub }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        // const recipient = await User.findOne({ where: { wallet_address: to } });

        // if (!recipient) {
        //   throw new UserInputError("User not found");
        // } else if (recipient.wallet_address === user.wallet_address) {
        //   throw new UserInputError("You cant message yourself");
        // }

        if (to === user.wallet_address) {
          throw new UserInputError("You cant message yourself");
        }

        if (content.trim() === "") {
          throw new UserInputError("Message is empty");
        }

        const message = await MessageModel.create({
          from: user.wallet_address,
          to,
          content,
        });

        pubsub.publish("NEW_MESSAGE", { newMessage: message });

        return message;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (_, __, { pubsub, user }) => {
          if (!user) throw new AuthenticationError("Unauthenticated");
          return pubsub.asyncIterator(["NEW_MESSAGE"]);
        },
        ({ newMessage }, _, { user }) => {
          if (
            newMessage.from === user.wallet_address ||
            newMessage.to === user.wallet_address
          ) {
            return true;
          }

          return false;
        }
      ),
    },
  },
};
