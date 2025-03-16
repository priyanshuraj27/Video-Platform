require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const { Strategy } = require('passport-google-oauth20');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(session({ secret: 'your_secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(new Strategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  },
  (accessToken, refreshToken, profile, done) => {
    done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('http://localhost:3000/dashboard'); // Redirect to frontend
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/auth/user', (req, res) => {
  res.json(req.user || null);
});

// Start Server
app.listen(5000, () => console.log('Server running on http://localhost:5000'));
