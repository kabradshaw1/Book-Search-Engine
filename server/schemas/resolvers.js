const { AuthenticationError } = require('apollo-server-express');
const { Book, User } = require('../models')
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {

  },
  Mutation: {
    
  }
};

module.exports = resolvers;