const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');
const { comparePassword } = require('../utils/bcrypt');

module.exports = function initializePassport(passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async function (email, password, done) {
        try {
          const user = await User.findOne({ email: email.toLowerCase().trim() });
          if (!user) return done(null, false, { message: 'Invalid email' });
          if (!user.password) {
            return done(null, false, {
              message: 'This account uses Google sign-in. Please continue with Google.',
            });
          }
          const isValid = await comparePassword(password, user.password);
          if (!isValid) return done(null, false, { message: 'Invalid password' });
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userEmail =
            profile.emails && profile.emails.length > 0
              ? profile.emails[0].value.toLowerCase().trim()
              : null;

          if (!userEmail) {
            return done(new Error('No email found from Google account'), null);
          }

          const googleAvatar =
            profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

          let user = await User.findOne({ email: userEmail });

          if (user) {
            if (!user.googleId) {
              user.googleId = profile.id;
            }
            if (!user.name && profile.displayName) {
              user.name = profile.displayName;
            }
            if (!user.avatar && googleAvatar) {
              user.avatar = googleAvatar;
            }
            if (user.authProvider !== 'google' && user.googleId) {
              user.authProvider = user.password ? user.authProvider : 'google';
            }
            await user.save();
            return done(null, user);
          }

          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: userEmail,
            avatar: googleAvatar,
            authProvider: 'google',
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
