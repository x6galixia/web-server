const bcrypt = require("bcrypt");
const passport = require("passport");
const { ConflictError } = require("../utils/errors");
const serverPool = require("../config/db");

const signup = async (req, res, next) => {
  const { name, email, username, password, role } = req.body;

  try {
    // Check if email already exists
    const emailCheck = await serverPool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.redirect("/signup?error=Email already exists");
    }

    // Check if username already exists
    const usernameCheck = await serverPool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (usernameCheck.rows.length > 0) {
      return res.redirect("/signup?error=Username already exists");
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user into the database
    const newUser = await serverPool.query(
      "INSERT INTO users (name, email, username, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, username, role, created_at",
      [name, email, username, hashedPassword, role]
    );

    // Get the newly created user (excluding the password)
    const user = newUser.rows[0];

    // Redirect to the login page with a success message
    res.redirect('/login?success=Account created successfully. Please log in.');
  } catch (err) {
    // Handle unexpected errors
    res.redirect("/signup?error=An error occurred during signup");
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      // Redirect with an error message if email or password is missing
      return res.redirect("/login?error=Email and password are required");
    }

    passport.authenticate("local", (err, user, info) => {
      if (err) {
        // Redirect with a generic error message
        return res.redirect("/login?error=An error occurred during login");
      }
      if (!user) {
        // Redirect with the error message from Passport (info.message)
        return res.redirect(`/login?error=${info.message || "Invalid email or password"}`);
      }

      req.logIn(user, (err) => {
        if (err) {
          // Redirect with a generic error message
          return res.redirect("/login?error=An error occurred during login");
        }
        // Redirect based on user role
        if (user.role === 'user') {
          return res.redirect("/home");
        } else {
          return res.redirect("/dashboard");
        }
      });
    })(req, res, next);
  } catch (err) {
    // Handle unexpected errors
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/login');
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  login,
  logout,
};
