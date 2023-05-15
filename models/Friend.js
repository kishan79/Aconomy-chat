const mongoose = require("mongoose");

const FriendSchema = new mongoose.Schema(
  {
    address: {
      type: String,
    },
    wallet_address: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Friend", FriendSchema);
