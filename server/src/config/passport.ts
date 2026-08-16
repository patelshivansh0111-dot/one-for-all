import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import User from '../models/User';
import { env, isGoogleOAuthConfigured } from './env';

if (isGoogleOAuthConfigured()) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile: Profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email from Google'), undefined);
          }

          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

          if (user) {
            if (!user.googleId) {
              user.googleId = profile.id;
              user.isEmailVerified = true;
              await user.save();
            }
            return done(null, user as Express.User);
          }

          const baseUsername = profile.displayName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .slice(0, 15) || 'user';
          let username = baseUsername;
          let counter = 1;
          while (await User.findOne({ username })) {
            username = `${baseUsername}${counter++}`;
          }

          user = await User.create({
            name: profile.displayName,
            username,
            email,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || '',
            isEmailVerified: true,
            password: undefined,
          });

          return done(null, user as Express.User);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, (user as Express.User)._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, (user as Express.User | null) ?? false);
  } catch (error) {
    done(error, false);
  }
});

export default passport;
