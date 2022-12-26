const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    _id: ID
    username: String
    email: String
    bookCount: Int
    Books: [Book]
  }

  type Book {
    bookId : String
    authors: String
    description: String
    title:
    image:
    link:
  }

  type Auth {
    token: ID!
    user: User
  }

  type saveBookInput {

  }

  type removeBook {

  }

  type Query {
    me: User
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(): User
    removeBook(bookId:): User
`;

module.exports = typeDefs;