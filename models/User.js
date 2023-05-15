const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    wallet_address: {
      type: String,
      unique: [true, "Wallet address needs to be unique"],
    },
    signatureMessage: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
