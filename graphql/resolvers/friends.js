const { UserInputError, AuthenticationError } = require("apollo-server");
const FriendModel = require("../../models/Friend");

module.exports = {
  Query: {},
  Mutation: {
    addWalletUser: async (_, args, { user }) => {
      const { wallet_address, user_wallet_address } = args;
      try {
        // if (!user) throw new AuthenticationError("Unauthenticated");

        const result = await FriendModel.findOne({
          address: user_wallet_address,
          wallet_address,
        });

        if (result) throw new UserInputError("User already added");

        await FriendModel.insertMany([
          {
            address: user_wallet_address,
            wallet_address,
          },
          {
            address: wallet_address,
            wallet_address: user_wallet_address,
          },
        ]);

        return { wallet_address };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};