const { UserInputError, AuthenticationError } = require("apollo-server");
const crypto = require("crypto");
const MessageModel = require("../../models/Message");
const UserModel = require("../../models/User");
const ValidatorModel = require("../../models/Validator");
const FriendModel = require("../../models/Friend");

module.exports = {
  Query: {
    getUsers: async (_, { user_wallet_address }, { user }) => {
      try {
        // if (!user) throw new AuthenticationError("Unauthenticated");

        let users = await FriendModel.find({
          address: user_wallet_address,
          wallet_address: { $ne: user_wallet_address },
        })
          .sort({ createdAt: -1 })
          .select(
            "wallet_address address createdAt wallet_addressUser wallet_addressUserType addressUser addressUserType"
          )
          .populate([
            {
              path: "addressUser",
              select: "_id name username profileImage role",
            },
            {
              path: "wallet_addressUser",
              select: "_id name username profileImage role",
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

        users.sort((a, b) => {
          if (a.latestMessage === undefined) {
            return 1;
          }

          if (b.latestMessage === undefined) {
            return -1;
          }

          if (a.latestMessage.createdAt === b.latestMessage.createdAt) {
            return 0;
          }

          return a.latestMessage.createdAt > b.latestMessage.createdAt ? -1 : 1;
        });

        return users;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    getSearchUsers: async (_, { param }, { user }) => {
      try {
        // if (!user) throw new AuthenticationError("Unauthenticated");

        if (param !== "") {
          let users = await UserModel.find({
            $and: [
              {
                $or: [
                  { name: { $regex: param, $options: "i" } },
                  { username: { $regex: param, $options: "i" } },
                  { wallet_address: param },
                ],
              },
              { role: { $ne: "admin" } },
              { username: { $ne: "" } },
            ],
          }).select(
            "name username role wallet_address profileImage kycEventType"
          );

          let validators = await ValidatorModel.find({
            $or: [
              { name: { $regex: param, $options: "i" } },
              { username: { $regex: param, $options: "i" } },
              { wallet_address: param },
            ],
          }).select(
            "name username role wallet_address profileImage kybEventType"
          );

          let allUsers = [...validators, ...users];

          return allUsers;
        } else {
          return [];
        }
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

        const unreadMessages = await MessageModel.find({
          to: wallet_address,
          read: false,
        }).select("_id");

        return { wallet_address, newMessages: !!unreadMessages.length };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};
