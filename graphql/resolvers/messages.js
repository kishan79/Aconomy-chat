const {
  UserInputError,
  AuthenticationError,
  // withFilter,
} = require("apollo-server");
const { withFilter } = require("graphql-subscriptions");
const MessageModel = require("../../models/Message");

module.exports = {
  Query: {
    getMessages: async (parent, { from, user_wallet_address }, { user }) => {
      try {
        // if (!user) throw new AuthenticationError("Unauthenticated");

        const walletAddresses = [user_wallet_address, from];

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
    sendMessage: async (
      parent,
      { to, content, user_wallet_address },
      { user, pubsub }
    ) => {
      try {
        // if (!user) throw new AuthenticationError("Unauthenticated");

        // const recipient = await User.findOne({ where: { wallet_address: to } });

        // if (!recipient) {
        //   throw new UserInputError("User not found");
        // } else if (recipient.wallet_address === user.wallet_address) {
        //   throw new UserInputError("You cant message yourself");
        // }

        if (to === user_wallet_address) {
          throw new UserInputError("You cant message yourself");
        }

        if (content.trim() === "") {
          throw new UserInputError("Message is empty");
        }

        const message = await MessageModel.create({
          from: user_wallet_address,
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
    readMessage: async (
      parent,
      { wallet_address, user_wallet_address },
      { user, pubsub }
    ) => {
      try {
        // if (!user) throw new AuthenticationError("Unauthenticated");

        const message = await MessageModel.updateMany(
          {
            from: user_wallet_address,
            to: wallet_address,
          },
          {
            read: true,
          }
        );

        if (message) {
          return { readMessage: true };
        } else {
          return { readMessage: false };
        }
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
          // if (!user) throw new AuthenticationError("Unauthenticated");
          return pubsub.asyncIterator(["NEW_MESSAGE"]);
        },
        ({ newMessage }, { user_wallet_address }, { user }) => {
          if (
            newMessage.from === user_wallet_address ||
            newMessage.to === user_wallet_address
          ) {
            return true;
          }

          return false;
        }
      ),
    },
  },
};
