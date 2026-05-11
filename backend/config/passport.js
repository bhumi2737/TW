const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy; 
const User = require('../models/userModel');
const { comparePassword } = require('../utils/bcrypt');

module.exports = function (passport) {
    // 1. LOCAL STRATEGY
    passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' },
        async function (email, password, done) {
            try {
                const user = await User.findOne({ email: email.toLowerCase().trim() });
                if (!user) return done(null, false, { message: 'Invalid email' });
                const isValid = await comparePassword(password, user.password);
                if (!isValid) return done(null, false, { message: 'Invalid password' });
                return done(null, user);
            } catch (error) { return done(error); }
        }
    ));

    // 2. GOOGLE STRATEGY (ID FIXED HERE)
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
         scope: ['profile', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Email fetch karne ka sahi tarika
                const userEmail = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

                if (!userEmail) {
                    return done(new Error("No email found"), null);
                }

                let user = await User.findOne({ email: userEmail });
                if (user) {
                    return done(null, user);
                } else {
                    // Naya user create karna
                    const newUser = await User.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: userEmail
                    });
                    return done(null, newUser);
                }
            } catch (error) { return done(error, null); }
        }
    ));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try { const user = await User.findById(id); done(null, user); }
        catch (error) { done(error); }
    });
};