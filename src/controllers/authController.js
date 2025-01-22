const bcrypt = require("bcrypt");
const passport = require("passport");
const serverPool = require("../config/db");

const signup = async (req, res, next) => {
  const { name, email, username, password, confirmPassword, role } = req.body;

  try {
    // Check if any required field is missing
    if (!name || !email || !username || !password || !confirmPassword) {
      let errorField = "";
      if (!name) errorField = "name";
      else if (!email) errorField = "email";
      else if (!username) errorField = "username";
      else if (!password) errorField = "password";
      else if (!confirmPassword) errorField = "confirmPassword";
      return res.redirect(`/signup?error=All fields are required&name=${name || ""}&email=${email || ""}&username=${username || ""}&errorField=${errorField}`);
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.redirect(`/signup?error=Passwords do not match&name=${name}&email=${email}&username=${username}&errorField=confirmPassword`);
    }

    // Check if email already exists
    const emailCheck = await serverPool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.redirect(`/signup?error=Email already exists&name=${name}&email=${email}&username=${username}&errorField=email`);
    }

    // Check if username already exists
    const usernameCheck = await serverPool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (usernameCheck.rows.length > 0) {
      return res.redirect(`/signup?error=Username already exists&name=${name}&email=${email}&username=${username}&errorField=username`);
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
    res.redirect(`/signup?error=An error occurred during signup&name=${name}&email=${email}&username=${username}`);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check if email or password is missing
    if (!email || !password) {
      let errorField = "";
      if (!email) errorField = "email";
      if (!password) errorField = "password";
      return res.redirect(`/login?error=Email and password are required&email=${email || ""}&password=${password || ""}&errorField=${errorField}`);
    }

    // Authenticate user
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        // Handle unexpected errors
        return res.redirect(`/login?error=An error occurred during login&email=${email}&password=${password}`);
      }
      if (!user) {
        // Handle invalid credentials
        let errorField = "email"; // Default to email field for invalid credentials
        if (info && info.message === "Incorrect password.") {
          errorField = "password"; // Highlight password field if the password is incorrect
        }
        return res.redirect(`/login?error=${info.message || "Invalid email or password"}&email=${email}&password=${password}&errorField=${errorField}`);
      }

      // Log in the user
      req.logIn(user, (err) => {
        if (err) {
          // Handle login errors
          return res.redirect(`/login?error=An error occurred during login&email=${email}&password=${password}`);
        }
        // Redirect based on user role
        if (user.role === "user") {
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
