const bcrypt = require("bcryptjs");
const { UserInputError, AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { ethers } = require("ethers");
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
    login: async (_, args) => {
      const { wallet_address, password } = args;
      let errors = {};

      try {
        if (wallet_address.trim() === "")
          errors.wallet_address = "wallet_address must not be empty";
        if (password === "") errors.password = "password must not be empty";

        if (Object.keys(errors).length > 0) {
          throw new UserInputError("bad input", { errors });
        }

        const user = await UserModel.findOne({
          where: { wallet_address },
        });

        if (!user) {
          errors.wallet_address = "user not found";
          throw new UserInputError("user not found", { errors });
        }

        const correctPassword = await bcrypt.compare(password, user.password);

        if (!correctPassword) {
          errors.password = "password is incorrect";
          throw new UserInputError("password is incorrect", { errors });
        }

        const token = jwt.sign({ wallet_address }, process.env.JWT_SECRET, {
          expiresIn: 60 * 60,
        });

        return {
          ...user.toJSON(),
          createdAt: user.createdAt.toISOString(),
          token,
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Mutation: {
    register: async (_, args) => {
      let { wallet_address, email, password, confirmPassword } = args;
      let errors = {};

      try {
        // Validate input data
        if (email.trim() === "") errors.email = "email must not be empty";
        if (wallet_address.trim() === "")
          errors.wallet_address = "wallet_address must not be empty";
        if (password.trim() === "")
          errors.password = "password must not be empty";
        if (confirmPassword.trim() === "")
          errors.confirmPassword = "repeat password must not be empty";

        if (password !== confirmPassword)
          errors.confirmPassword = "passwords must match";

        // // Check if username / email exists
        // const userByUsername = await User.findOne({ where: { username } })
        // const userByEmail = await User.findOne({ where: { email } })

        // if (userByUsername) errors.username = 'Username is taken'
        // if (userByEmail) errors.email = 'Email is taken'

        if (Object.keys(errors).length > 0) {
          throw errors;
        }

        // Hash password
        password = await bcrypt.hash(password, 6);

        // Create user
        const user = await UserModel.create({
          wallet_address,
          email,
          password,
        });

        // Return user
        return user;
      } catch (err) {
        console.log(err);
        if (err.name === "SequelizeUniqueConstraintError") {
          err.errors.forEach(
            (e) => (errors[e.path] = `${e.path} is already taken`)
          );
        } else if (err.name === "SequelizeValidationError") {
          err.errors.forEach((e) => (errors[e.path] = e.message));
        }
        throw new UserInputError("Bad input", { errors });
      }
    },
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
    doEthereumAuth: async (_, args) => {
      const { wallet_address, signature } = args;
      try {
        const user = await UserModel.findOne({
          wallet_address,
        });
        console.log(user.signatureMessage);
        if (user) {
          const signerAddr = await ethers.utils.verifyMessage(
            user.signatureMessage,
            signature
          );
          console.log(signerAddr);
          if (signerAddr === wallet_address) {
            const token = jwt.sign({ wallet_address }, process.env.JWT_SECRET, {
              expiresIn: 60 * 60,
            });
            return { token };
          }
        }
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};
