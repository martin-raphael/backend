![email verify](https://github.com/user-attachments/assets/44a52ce0-6a0b-4844-b06e-b874df97b891)

Here's a README file for the code you shared:

---

# User Authentication API

This Node.js and Express.js API provides user authentication functionality, including sign-up, sign-in, email verification, and password encryption. The system uses `MongoDB` for data storage and `Nodemailer` for sending verification emails.

## Features

- **Sign-Up**: Allows new users to register. Passwords are hashed using bcrypt for security.
- **Email Verification**: A verification email is sent to confirm the user's identity. Verification links expire after 6 hours.
- **Sign-In**: Users can log in if they have verified their email addresses.
- **Error Handling**: Clear and descriptive error messages help users troubleshoot issues with registration, verification, and login.

## Technologies

- **Node.js** with **Express**: Backend server
- **MongoDB**: Data storage
- **Nodemailer**: Email sending for verification
- **dotenv**: Environment variable management
- **bcrypt**: Password hashing for security

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js
- MongoDB
- NPM (Node Package Manager)

### Installation

1. Clone this repository:
   ```bash
   git clone <repository_url>
   cd <repository_name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file and configure the following environment variables:
   ```plaintext
   AUTH_EMAIL=<your_email>
   AUTH_PASSWORD=<your_email_password>
   MONGO_URI=<your_mongo_connection_uri>
   ```

4. Ensure MongoDB is running.

5. Start the server:
   ```bash
   npm start
   ```

### API Endpoints

#### Sign-Up

- **Method**: `POST`
- **Endpoint**: `/signup`
- **Request Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "user_password",
    "dateOfBirth": "YYYY-MM-DD"
  }
  ```
- **Response**: JSON with success/failure message.

#### Email Verification

- **Method**: `GET`
- **Endpoint**: `/verify/:userId/:uniqueString`
- **Purpose**: Verifies user email with the unique string provided in the verification email.
- **Response**: Redirects to success/error page.

#### Sign-In

- **Method**: `POST`
- **Endpoint**: `/signin`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "user_password"
  }
  ```
- **Response**: JSON with success/failure message.

**Notes**

1. **Verification Link**: The link expires in 6 hours.
2. **MongoDB Schema**: Ensure that `User` and `UserVerification` schemas are set up in your MongoDB database.

## Troubleshooting

- **Nodemailer**: Make sure to enable "less secure app access" on your Gmail account, or consider using OAuth for production environments.
- **Port Configuration**: Default port is 5000, but you can adjust as needed.

## License

This project is licensed under the MIT License.
