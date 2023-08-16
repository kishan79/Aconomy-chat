const { UserInputError, AuthenticationError } = require("apollo-server");
const crypto = require("crypto");
const MessageModel = require("../../models/Message");
const UserModel = require("../../models/User");
const FriendModel = require("../../models/Friend");

module.exports = {
  Query: {
    getUsers: async (_, { user_wallet_address }, { user }) => {
      try {
        // if (!user) throw new AuthenticationError("Unauthenticated");

        let users = await FriendModel.find({
          address: user_wallet_address,
          wallet_address: { $ne: user_wallet_address },
        }).sort({ createdAt: -1 })
          .select(
            "wallet_address address createdAt wallet_addressUser wallet_addressUserType addressUser addressUserType"
          )
          .populate([
            {
              path: "addressUser",
              select: "_id name username profileImage",
            },
            {
              path: "wallet_addressUser",
              select: "_id name username profileImage",
            },
          ]);

        const allUserMessages = await MessageModel.find({
          $or: [{ from: user_wallet_address }, { to: user_wallet_address }],
        }).sort({ createdAt: -1 });

        users = users.map((otherUser) => {
          const latestMessage = allUserMessages.find(
            (m) =>
              m.from === otherUser.wallet_address ||
              m.to === otherUser.wallet_address
          );
          otherUser.latestMessage = latestMessage;
          return otherUser;
        });
        
        return users;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Mutation: {
    getAuthSignatureMessage: async (_, args) => {
      const { wallet_address } = args;
      try {
        // const user = await UserModel.findOne({ wallet_address });

        // const signatureMessage = `I want to login to Pandora messenger ${crypto
        //   .randomBytes(64)
        //   .toString("hex")}`;

        // if (!user) {
        //   await UserModel.create({
        //     wallet_address,
        //     signatureMessage,
        //   });
        // } else {
        //   await UserModel.findOneAndUpdate(
        //     { wallet_address },
        //     { signatureMessage }
        //   );
        // }

        return { wallet_address };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};
