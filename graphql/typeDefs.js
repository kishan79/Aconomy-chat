module.exports = `#graphql
  type User {
    wallet_address: String!
    email: String
    createdAt: String!
    token: String
    latestMessage: Message
    wallet_addressUser: addressUser
  }
  type addressUser {
    _id: String!
    name: String
    username: String
    profileImage: String
  }
  type Message {
    _id: String!
    content: String!
    from: String!
    to: String!
    createdAt: String!
  }
  type Signature {
    signatureMessage: String!
  }
  type Token {
    token: String!
  }
  type Wallet{
    wallet_address: String!
  }
  type Msg{
    message: String!
    success: Boolean!
  }
  type Query {
    getUsers(user_wallet_address: String!): [User]!
    getMessages(from: String!, user_wallet_address: String!): [Message]!
    
  }
  type Mutation {
    sendMessage(to: String!, content: String!, user_wallet_address: String!): Message!
    getAuthSignatureMessage(wallet_address: String!): Wallet!
    addWalletUser(wallet_address: String!, user_wallet_address: String!): Wallet!
    checkAddress(wallet_address: String!): Msg!
  }
  type Subscription {
    newMessage(user_wallet_address: String!): Message!
  }
`