# Security Features

TruthGuard AI incorporates several security and abuse prevention mechanisms to operate safely as a free-tier web service.

## 1. Input Validation & Sanitization
* **Schema Validation**: Built using Pydantic, all incoming request bodies are structurally validated before reaching the API logic.
* **Length Constraints**: 
  * Rejects text less than 50 characters.
  * Free-tier users are dynamically limited to 5000 characters per request.
  * Hard absolute limit of 20000 characters for all users to prevent memory exhaustion attacks.
* **Content Sanitization**: We actively filter out zero-width characters, null bytes, and other unsafe control characters using regex sanitization on incoming JSON text.

## 2. Authentication & Authorization
* **JWT (JSON Web Tokens)**: We utilize OAuth2 Password Flow with short-lived JWT Bearer tokens to handle authentication.
* **Secure Hashing**: Passwords are never stored in plaintext. We use `passlib` with `bcrypt` for secure hashing and salting.
* **Environment Secrets**: JWT signing keys (`SECRET_KEY`) are managed strictly through environment variables.
* **Role-Based Access Control (RBAC)**: We enforce role checks at the route level. For example, the `/admin/*` routes are protected by a specific `get_admin_user` dependency that strictly verifies the `admin` role.

## 3. Database & Data Isolation
* **Row-Level Tenancy Logic**: The predictions API (`/predictions`) enforces tenancy by always appending `Prediction.user_id == current_user.id` to SQLAlchemy queries. Users physically cannot fetch, delete, or interact with predictions owned by other users.
* **ORM Protection**: By using SQLAlchemy as an Object Relational Mapper, we are completely protected against traditional SQL injection vulnerabilities.

## 4. Abuse Prevention & Rate Limiting
* **Daily Usage Limits**: We track usage per user using the PostgreSQL `api_usage` table. This satisfies the free-tier architectural constraint (avoiding Redis) while effectively enforcing limits:
  * Free users: 10 requests per day.
  * Premium users: 200 requests per day.
  * Admins: Unlimited.
* **Duplicate Request Caching**: To prevent malicious looping scripts (or accidental double clicks) from draining resources, the `/predict` API checks if a user has requested a prediction for the exact same text within the last 24 hours. If found, the API returns the cached database entry instantaneously without invoking the AI model or incrementing the user's daily usage limit.

## 5. Error Protection & Network Security
* **Global Exception Handling**: A generic global exception handler catches any unhandled 500 internal server errors, logs the full stack trace internally, and returns a safe `"An unexpected internal error occurred."` JSON response to the client. Stack traces are never leaked in production.
* **CORS (Cross-Origin Resource Sharing)**: We restrict cross-origin requests exclusively to the exact domains specified in the `FRONTEND_URL` environment variable.

## 6. Secrets Management
* No API keys, database credentials, or secret keys are hardcoded in the repository.
* A `.env.example` file acts as a manifest for the required environment variables.
