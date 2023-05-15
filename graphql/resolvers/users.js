// const bcrypt = require("bcryptjs");
const { UserInputError, AuthenticationError } = require("apollo-server");
// const jwt = require("jsonwebtoken");
const crypto = require("crypto");
// const { ethers } = require("ethers");
const MessageModel = require("../../models/Message");
const UserModel = require("../../models/User");
const FriendModel = require("../../models/Friend");

// const { JWT_SECRET } = require("../../config/env.json");

module.exports = {
  Query: {
    getUsers: async (_, __, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        let users = await FriendModel.find({
          address: user.wallet_address,
          wallet_address: { $ne: user.wallet_address },
        }).select("wallet_address address createdAt");
        console.log(users);

        const allUserMessages = await MessageModel.find({
          $or: [{ from: user.wallet_address }, { to: user.wallet_address }],
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
        const user = await UserModel.findOne({ wallet_address });

        const signatureMessage = `I want to login to Pandora messenger ${crypto
          .randomBytes(64)
          .toString("hex")}`;

        if (!user) {
          await UserModel.create({
            wallet_address,
            signatureMessage,
          });
        } else {
          await UserModel.findOneAndUpdate(
            { wallet_address },
            { signatureMessage }
          );
        }

        return { signatureMessage };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    // doEthereumAuth: async (_, args) => {
    //   const { wallet_address, signature } = args;
    //   try {
    //     const user = await UserModel.findOne({
    //       wallet_address,
    //     });
    //     console.log(user.signatureMessage);
    //     if (user) {
    //       const signerAddr = await ethers.utils.verifyMessage(
    //         user.signatureMessage,
    //         signature
    //       );
    //       console.log(signerAddr);
    //       if (signerAddr === wallet_address) {
    //         const token = jwt.sign({ wallet_address }, process.env.JWT_SECRET, {
    //           expiresIn: 60 * 60,
    //         });
    //         return { token };
    //       }
    //     }
    //   } catch (err) {
    //     console.log(err);
    //     throw err;
    //   }
    // },
  },
};
