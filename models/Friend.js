const mongoose = require("mongoose");

const FriendSchema = new mongoose.Schema(
  {
    address: {
      type: String,
    },
    addressUser: {
      type: mongoose.Schema.ObjectId,
      refPath: "addressUserType",
    },
    addressUserType: {
      type: String,
      enum: ["User", "Validator"],
    },
    wallet_address: {
      type: String,
    },
    wallet_addressUser: {
      type: mongoose.Schema.ObjectId,
      refPath: "wallet_addressUserType",
    },
    wallet_addressUserType: {
      type: String,
      enum: ["User", "Validator"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Friend", FriendSchema);
