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
          .populate('book')

        return userData;
      }
      throw new AuthenticationError('Not logged in');
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
    // from deep-thoughts and changed it to book.  Currected now.  I tried 
    // to use the Books.create() method.  I think the rest was good.
    saveBook: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          // take the input type to replace "body" as the arguement
          { $addToSet: { savedBooks: args.input } },
          { new: true, runValidators: true }
        );

        return updatedUser;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    // kind of at a loss here as I don't really have a similar example.  It's
    // clear that I could stand to learn more about what exactly the difference
    // is in how this works vs controllers.  Kind of a rough guess for how this should
    // be, for now.  Currected now.  I missed the if statement the first time.
    removeBook: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args.bookId } } },
          { new: true }
        );

        return updatedUser;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
  }
};

module.exports = resolvers;