1.  **Enable Authentication Methods:**
    *   In your Supabase project dashboard, go to "Authentication" (the shield icon) -> "Settings".
    *   Under "Authentication Providers", enable the methods you want to support (e.g., Email, Google, GitHub).
    *   For Email, you can configure email templates for sign-up, password reset, etc.
    *   For social logins, you'll need to configure OAuth credentials with the respective providers (e.g., Google Cloud Console for Google, GitHub Developer Settings for GitHub) and add the client ID and secret to Supabase.

2.  **Configure Redirect URLs:**
    *   Under "Authentication" -> "Settings", add your application's redirect URLs under "Site URL" and "Redirect URLs". For local development, this might be `http://localhost:3000` (or whatever port your frontend runs on).

## 3. Integrating Supabase with Your Node.js Express Backend

This section focuses on using the `supabase-js` client library on your server to interact with Supabase Authentication.

### 3.1. Installation

Install the Supabase JavaScript client library:

```bash
npm install @supabase/supabase-js
```

### 3.2. Initializing Supabase Client

It's best practice to initialize the Supabase client once and reuse it. You can create a `supabase.js` file in your `config` directory.

**`server/config/supabase.js`**

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use the service_role key on the server

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
```

**Important:** Store your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in environment variables (e.g., in a `.env` file) and *never* commit them to your version control.

### 3.3. User Registration (Sign Up)

You can create an API endpoint for user registration. Note that for email/password sign-up, Supabase can handle email confirmation if configured.

**`server/server.js` (or a dedicated auth router)**

```javascript
const express = require('express');
const app = express();
const supabase = require('./config/supabase'); // Adjust path as needed

app.use(express.json()); // For parsing application/json

// User Registration
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // If email confirmation is enabled, data.user might be null initially
    if (data.user) {
      res.status(201).json({ message: 'User registered successfully', user: data.user });
    } else {
      res.status(200).json({ message: 'Please check your email for a confirmation link.' });
    }

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ... other routes and server setup

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 3.4. User Login (Sign In)

Create an endpoint for users to log in.

**`server/server.js` (or a dedicated auth router)**

```javascript
// User Login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.status(200).json({ message: 'Logged in successfully', session: data.session, user: data.user });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 3.5. Protecting Routes with Supabase Authentication

To protect routes, you'll need to verify the user's session token (JWT) sent from the client. Supabase provides a convenient way to do this on the server using the `getUser` method with the `service_role` key.

Create a middleware function to check authentication:

**`server/middleware/authMiddleware.js`**

```javascript
const supabase = require('../config/supabase'); // Adjust path as needed

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token using Supabase service_role key
      // This will validate the JWT and return the user if valid
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }

      req.user = user; // Attach the user object to the request
      next();

    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
```

Now, apply this middleware to any route you want to protect:

**`server/server.js`**

```javascript
const express = require('express');
const app = express();
const { protect } = require('./middleware/authMiddleware'); // Adjust path as needed

app.use(express.json());

// ... auth routes (signup, login)

// Protected route example
app.get('/api/protected-data', protect, async (req, res) => {
  // req.user will contain the authenticated user's data
  res.status(200).json({ message: `Welcome, ${req.user.email}! This is protected data.`, user: req.user });
});

// ... other routes and server setup
```

### 3.6. User Logout

While typically handled on the client-side by clearing the session, you can also have a server-side logout if needed (e.g., for server-rendered apps or to invalidate server-side sessions if you implement them).

```javascript
// User Logout
app.post('/auth/logout', protect, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Logged out successfully' });

  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## 4. Frontend Integration (Briefly)

On the frontend (e.g., React, Vue, etc.), you would use the *public* `anon` key to initialize the Supabase client. The client-side `supabase-js` library handles storing the session (JWT) in local storage and automatically attaching it to requests to Supabase services (like database queries).

When making requests to your *Node.js backend*, you would typically send the Supabase session token (JWT) in the `Authorization` header as a Bearer token, which your `protect` middleware will then verify.

## 5. Important Security Considerations

*   **Environment Variables:** Always use environment variables for your Supabase keys, especially the `SUPABASE_SERVICE_ROLE_KEY`. Never hardcode them or commit them to your repository.
*   **HTTPS:** Ensure your application is served over HTTPS in production to protect sensitive data during transit.
*   **Error Handling:** Implement robust error handling on both the client and server to gracefully manage authentication failures.
*   **Rate Limiting:** Consider implementing rate limiting on your authentication endpoints (`/auth/signup`, `/auth/login`) to prevent brute-force attacks.
*   **Row-Level Security (RLS):** If you're using Supabase for your database, leverage RLS to define fine-grained access control policies directly on your database tables. This is crucial for data security.
*   **JWT Expiration:** Supabase JWTs have an expiration. Your client-side application should handle token refresh if needed, though `supabase-js` often handles this automatically for its own API calls. For your custom backend API calls, ensure your client refreshes and sends a valid token.

By following these steps, you can successfully integrate Supabase authentication into your Node.js Express application, providing a secure and scalable authentication solution.

## 6. Troubleshooting Email Confirmation Issues

If you're not receiving email confirmations from Supabase, here are the most common causes and solutions:

### 6.1. Check Email Confirmation Settings

1. **Go to your Supabase Dashboard**
2. **Navigate to Authentication → Settings**
3. **Check "Email Confirmation" settings**:
   - Make sure "Enable email confirmations" is turned **OFF** for development
   - Or if you want to keep it ON, ensure your email settings are properly configured

### 6.2. Disable Email Confirmation for Development

For development purposes, you can disable email confirmation:

1. In your Supabase Dashboard, go to **Authentication → Settings**
2. Scroll down to **"Email Confirmation"**
3. **Turn OFF** "Enable email confirmations"
4. Click **Save**

This allows users to sign up and login immediately without email verification.

### 6.3. Configure Email Provider (if keeping email confirmation ON)

If you want to keep email confirmation enabled, you need to configure an email provider:

1. **Go to Authentication → Settings → SMTP Settings**
2. **Configure your email provider** (Gmail, SendGrid, etc.)
3. **Or use Supabase's built-in email** (has daily limits)

### 6.4. Check Spam/Junk Folder

Sometimes confirmation emails end up in spam. Check:
- Spam/Junk folder
- Promotions tab (if using Gmail)
- All Mail folder

### 6.5. Test Without Email Confirmation

Try signing up with email confirmation disabled first, then enable it later once everything else works.

### 6.6. Alternative: Auto-Confirm Users (Development Only)

For development, you can auto-confirm users by modifying the signup:

```javascript
// In server.js - DEVELOPMENT ONLY
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback' // Optional
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // For development: If user was created but not confirmed, auto-confirm them
    if (data.user && !data.user.email_confirmed_at) {
      // Note: This requires service_role key and should only be used in development
      const { error: confirmError } = await supabase.auth.admin.updateUserById(
        data.user.id,
        { email_confirm: true }
      );
      
      if (confirmError) {
        console.log('Auto-confirmation failed:', confirmError.message);
      } else {
        console.log('User auto-confirmed for development');
      }
    }

    res.status(201).json({ 
      message: 'User registered successfully', 
      user: data.user,
      note: 'Email confirmation disabled for development'
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**⚠️ Important:** Only use auto-confirmation in development, never in production!