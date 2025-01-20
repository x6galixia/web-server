document
  .getElementById("signupForm")
  .addEventListener("submit", function (event) {
    let valid = true;

    // Clear previous errors
    document.querySelectorAll(".error").forEach((el) => (el.textContent = ""));

    // Validate Name
    const name = document.getElementById("name").value.trim();
    if (!name) {
      document.getElementById("nameError").textContent = "Name is required";
      valid = false;
    }

    // Validate Email
    const email = document.getElementById("email").value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById("emailError").textContent =
        "Invalid email address";
      valid = false;
    }

    // Validate Username
    const username = document.getElementById("username").value.trim();
    if (!username) {
      document.getElementById("usernameError").textContent =
        "Username is required";
      valid = false;
    }

    // Validate Password
    const password = document.getElementById("password").value;
    if (password.length < 6) {
      document.getElementById("passwordError").textContent =
        "Password must be at least 6 characters long";
      valid = false;
    }

    // Validate Confirm Password
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (confirmPassword !== password) {
      document.getElementById("confirmPasswordError").textContent =
        "Passwords do not match";
      valid = false;
    }

    // Validate Role
    const role = document.getElementById("role").value;
    if (!["admin", "user"].includes(role)) {
      document.getElementById("roleError").textContent =
        'Role must be either "admin" or "user"';
      valid = false;
    }

    // Prevent form submission if validation fails
    if (!valid) {
      event.preventDefault();
    }
  });
