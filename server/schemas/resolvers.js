const { AuthenticationError } = require('apollo-server-express');
const { Book, User } = require('../models')
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    // I'm not really sure what they want me to populate here.  It 
    // seems like the controller was just doing the request for the 
    // entry in database.  I think the reason to use Apollo is probably 
    // that it makes it easier to request more information here with less 
    // code.  I can easily add populate books here.  Perhaps this is trying not 
    // to confuse us by keeping it simple.
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          // .populate('thoughts')
          // .populate('friends');

        return userData;
      }
      throw new AuthenticationError('Not logged in');
    },
    users: async () => {
      return User.find()
        .select('-__v -password')
        // .populate('thoughts')
        // .populate('friends');
    },
    user: async (parent, { username }) => {
      return User.findOne({ username })
        .select('-__v -password')
        // .populate('friends')
        // .populate('thoughts');
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
  
      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }
  
      const correctPw = await user.isCorrectPassword(password);
  
      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }
  
      const token = signToken(user);
      return { token, user };
    },
    // This is very similar to the addReaction, so I took that code
    // from deep-thoughts and changed it to book
    saveBook: async (parent, args, context) => {
      if (context.user) {
        const book = await Book.create({ ...args, username: context.user.username });

        await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { books: book._id } },
          { new: true }
        );

        return book;
      }
    },
    // kind of at a loss here as I don't really have a similar example.  It's
    // clear that I could stand to learn more about what exactly the difference
    // is in how this works vs controllers.  Kind of a rough guess for how this should
    // be, for now.
    removeBook: async (parent, args, context) => {
      const updatedUser = await User.FindOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId: params.bookId } }},
        { new: true }
      );

      return updatedUser
    },
  }
};

module.exports = resolvers;