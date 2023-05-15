// const { gql } = require('@apollo/server')

module.exports = `#graphql
  type User {
    wallet_address: String!
    email: String
    createdAt: String!
    token: String
    imageUrl: String
    latestMessage: Message
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
  type Query {
    getUsers: [User]!
    login(wallet_address: String!, password: String!): User!
    getMessages(from: String!): [Message]!
    
  }
  type Mutation {
    register(
      wallet_address: String!
      email: String!
      password: String!
      confirmPassword: String!
    ): User!
    sendMessage(to: String!, content: String!): Message!
    getAuthSignatureMessage(wallet_address: String!): Signature!
    doEthereumAuth(wallet_address: String!, signature: String!): Token!
    addWalletUser(wallet_address: String!): Wallet!
  }
  type Subscription {
    newMessage: Message!
  }
`
