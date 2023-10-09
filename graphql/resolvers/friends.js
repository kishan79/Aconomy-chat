const { UserInputError, AuthenticationError } = require("apollo-server");
const FriendModel = require("../../models/Friend");
const UserModel = require("../../models/User");
const ValidatorModel = require("../../models/Validator");
const { Role } = require("../../util/utils");

module.exports = {
  Query: {},
  Mutation: {
    addWalletUser: async (_, args, { user }) => {
      const { wallet_address, user_wallet_address } = args;
      try {
        // if (!user) throw new AuthenticationError("Unauthenticated");

        let user1 = await UserModel.findOne({
          $or: [{ wallet_address }, { username: wallet_address }],
        })
          .select("_id role")
          .lean();
        let validator1 = await ValidatorModel.findOne({
          $or: [{ wallet_address }, { username: wallet_address }],
        })
          .select("_id role")
          .lean();
        let data1 = !!user1 ? user1 : validator1;

        let user2 = await UserModel.findOne({
          wallet_address: user_wallet_address,
        })
          .select("_id role")
          .lean();
        let validator2 = await ValidatorModel.findOne({
          wallet_address: user_wallet_address,
        })
          .select("_id role")
          .lean();
        let data2 = !!user2 ? user2 : validator2;

        const result = await FriendModel.findOne({
          address: user_wallet_address,
          wallet_address,
        });

        if (result) throw new UserInputError("User already added");

        await FriendModel.insertMany([
          {
            address: user_wallet_address,
            addressUser: data2._id,
            addressUserType: Role[data2.role],
            wallet_address,
            wallet_addressUser: data1._id,
            wallet_addressUserType: Role[data1.role],
          },
          {
            address: wallet_address,
            addressUser: data1._id,
            addressUserType: Role[data1.role],
            wallet_address: user_wallet_address,
            wallet_addressUser: data2._id,
            wallet_addressUserType: Role[data2.role],
          },
        ]);

        return { wallet_address };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    checkAddress: async (_, { wallet_address }, { user }) => {
      try {
        // let User = await UserModel.find({ wallet_address });
        let User = await UserModel.find({
          $or: [{ wallet_address }, { username: wallet_address }],
        });
        // let Validator = await ValidatorModel.find({ wallet_address });
        let Validator = await ValidatorModel.find({
          $or: [{ wallet_address }, { username: wallet_address }],
        });
        if (User.length || Validator.length) {
          return { success: true, message: "User exists" };
        } else {
          return { success: false, message: "User doesn't exists" };
        }
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};
