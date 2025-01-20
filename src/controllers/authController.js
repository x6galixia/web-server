const bcrypt = require("bcrypt");
const passport = require("passport");
const { ConflictError } = require("../utils/errors");
const serverPool = require("../config/db");

const signup = async (req, res, next) => {
  const { name, email, username, password, role } = req.body;

  try {
    const emailCheck = await serverPool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (emailCheck.rows.length > 0) {
      throw new ConflictError("Email already exists");
    }

    const usernameCheck = await serverPool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (usernameCheck.rows.length > 0) {
      throw new ConflictError("Username already exists");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await serverPool.query(
      "INSERT INTO users (name, email, username, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, username, hashedPassword, role]
    );

    const user = newUser.rows[0];
    delete user.password;

    res.redirect('/login');
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return next(new BadRequestError("Email and password are required"));
    }

    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        if (user.role === 'user'){
          return res.redirect("/home");
        } else {
          return res.redirect("/dashboard");
        }
      });
      
    })(req, res, next);
  } catch (err) {
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
