# Viver Chat App - Backend

Welcome to the backend service of the **Viver Chat Application**. This server provides the core API and real-time communication capabilities for the Viver application, handling user authentication, friend relationships, presence, and messaging.

---

## 🚀 Features

- **Double Authentication Flow**: Supports standard email/password registration and Google OAuth sign-in.
- **Session Management**: Cookie-based authentication using signed, secure, HTTP-only session cookies.
- **Real-Time Communication**: Bidirectional messaging, user presence tracking, and friend requests powered by WebSockets.
- **Input Sanitization**: Robust data validation and parsing using [Zod](https://github.com/colinhacks/zod).
- **Persistent Storage**: MongoDB integration using [Mongoose](https://mongoosejs.com/) for managing users, sessions, connections, and message logs.
- **Message Lifecycle Controls**: Support for deleting messages for "everyone" or "just me".
- **Real-Time Synchronizations**: Automatic broadcasting of active user listings and real-time status updates (friend approvals, removals, new signups).

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Web Framework**: [Express.js](https://expressjs.com/) (v5.x)
- **WebSockets**: [ws](https://github.com/websockets/ws)
- **Database ORM**: [Mongoose](https://mongoosejs.com/) (MongoDB)
- **Validation**: [Zod](https://github.com/colinhacks/zod)
- **Utility**: `dotenv`, `cookie-parser`, `cookie-signature`, `cors`

---

## 📂 Project Structure

```bash
server/
├── login routes/            # HTTP Route handlers for authentication and friends
│   ├── BeginData.js         # Fetches chat history for a connection
│   ├── auth.js              # Authentication middleware validating session cookies
│   ├── connectionsTOMe.js   # Fetches a list of the user's friends
│   ├── friendsListRoute.js  # Fetches status mapping of all users
│   ├── login.js             # Email/Password login route
│   ├── logout.js            # Clears session cookies and invalidates session
│   ├── pendingReq.js        # Fetches incoming pending requests
│   ├── rejectReq.js         # HTTP route to reject friend requests
│   └── signUp.js            # Registers new users and handles Google OAuth token validation
├── zodSchemaValidation/     # Data validation schemas
│   └── zodValidation.js     # User registration and input schemas
├── main.js                  # App configuration, middleware application, and entry point
├── mongooseShema.js         # Mongoose DB connection and models
├── websocket.js             # WebSocket Server setup, authentication, and event loop
├── .env.example             # Example environment file template
└── package.json             # App scripts and dependencies
```

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file in the root of the `/server` folder. You can use the provided `.env.example` as a template:

```env
mongooseConnectionString="mongodb+srv://<username>:<password>@cluster0.mongodb.net/viver"
urlCommon="localhost"
uiUrl="http://localhost:5173"
Port=10000
SECRET="your-cookie-signing-secret"
SAME_SITE="lax" # Options: lax, strict, none
SECURE="false" # Set to true in production with HTTPS
```

---

## 🏃 Getting Started

### 1. Prerequisites
- Ensure you have **Node.js** (v18+) installed.
- Ensure you have a running **MongoDB** instance (local or Atlas cluster).

### 2. Install Dependencies
Navigate to the `server` directory and run:
```bash
npm install
```

### 3. Run in Development Mode
Start the development server with live reload:
```bash
npm run dev
```
The server will boot up and listen on the port specified in your `.env` (defaults to `10000` if not set).

---

## 🔌 API Documentation

### HTTP Routes

| Route | Method | Middleware | Description |
|---|---|---|---|
| `/signUp` | `PUT` | None | Register a new user with Name, Email, and Password |
| `/signUp/GoogleLogin` | `PUT` | None | Verify Google OAuth token and authenticate |
| `/login` | `POST` | None | Authenticate credentials and establish session |
| `/logout` | `POST` | None | Invalidate session and clear client cookies |
| `/beginChat/:from/:to` | `GET` | `auth` | Retrieve message history between two users |
| `/allUsers` | `GET` | `auth` | Retrieve list of all users and relationship statuses |
| `/pendingReq` | `PUT` | `auth` | Retrieve incoming friend requests for the user |
| `/connectionTOMe/:nameMine` | `GET` | `auth` | Retrieve lists of friends for the logged-in user |
| `/rejectReq` | `POST` | `auth` | Reject an incoming friend request |

---

## 💬 WebSocket Message Protocols

WebSocket connections are authenticated upon connection. The server extracts the `sid` cookie, validates it against the MongoDB session collection, and links the socket to the username.

Communication uses JSON strings with a `kindOf` property specifying the operation:

### Client to Server Messages
- `allUsersData`: Requests user relationships (friend, pending_sent, pending_received, none).
- `allFriendsToMe`: Requests the user's friend list.
- `addReq`: Sends a friend request to another user.
- `ack`: Accepts a friend request from another user.
- `rejectReq`: Rejects/cancels a friend request.
- `chat`: Sends a message to a friend (creates database record, triggers real-time delivery).
- `removeFriend`: Removes an existing friend.
- `deletingChat`: Deletes message(s) either for `everyone` (sender only) or `me` (updates `deletedFor` list).
- `pendingReqsForMe`: Requests pending requests list.
- `newLogin`: Informs the server of a login to trigger user-list updates across connected clients.

### Server to Client Messages
- `allUsersData`: Broadcasts full lists of users with relationship states.
- `allFriendsToMe`: Sends list of user's friends.
- `pendingsToMe`: Sends list of incoming friend requests.
- `messageSentAck`: Acknowledges receipt and DB write of sent chat message (with message ID).
- `chatMessage`: Real-time relay of incoming message.
- `friendRemoved`: Notifies client that they have been removed by a friend.
- `chatMessagesDeleted`: Broadcasts deletion updates so clients can purge deleted messages from views.
- `reLogin`: Instructs client to terminate socket and re-authenticate.
