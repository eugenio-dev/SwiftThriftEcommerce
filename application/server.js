const express = require("express");
const app = express();
const path = require("path");
const session = require('express-session');
const mysqlstore = require('express-mysql-session')(session);
const { connectToDatabase, pool } = require("./database/connection");

//Socket.io imports for messages
const httpServer = require('http');
const server = httpServer.createServer(app);

// Import all routes
const listingsRoutes = require('./routes/listings');
const listingUploads = require('./routes/listingUploads');
const authRoutes = require('./routes/authentication');
const dynamicPages = require('./routes/dynamicPages');
const staticPages = require('./routes/staticPages');
const profileUpload = require('./routes/profileUpload');
const messageRoutes = require('./routes/messages.js');
const userRoutes = require('./routes/userRoutes');
const imageRoute = require('./routes/imageReroute')

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "/public")));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Set up EJS for SSR
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views/pages"));

// Set up JSON parsing for requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up session store to store session data in the database
const sessionstore = new mysqlstore({
  expiration: 1000 * 60 * 60 * 24, // 1000 ms * 60 s * 60 m * 24 h = 1 day
  clearExpired: true,
  checkExpirationInterval: 1000 * 60 * 15, // 1000 ms * 60 s * 15m
  createDatabaseTable: false, // Table is custom-made
  schema: {
		tableName: 'sessions',
		columnNames: {
			session_id: 'session_id',
			expires: 'expires',
			data: 'data'
		}
	}
}, pool);

// Set up sessions for login and cookies
app.use(session({
  secret: process.env.SESS_SECRET || "B1Gchongu59292",
  resave: false,
  saveUninitialized: false,
  store: sessionstore,
  cookie: {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'secure',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 // 1000 ms * 60 s * 60 m * 24 h = 1 day
  }
}))

// Use route modules
app.use('/', dynamicPages);           // For EJS rendered routes
app.use('/', staticPages);         // For static HTML files
app.use('/api', listingsRoutes);    // For listing API endpoints
app.use('/api/auth', authRoutes);   // For auth API endpoints
app.use('/account/listing', listingUploads);
app.use('/', profileUpload);
app.use('/', require('./routes/authentication.js')); // selling from homepage
app.use('/', messageRoutes);
app.use('/', userRoutes);
app.use(imageRoute);

/** 
 * 
 * Socket io implementation for user authentication and 
 * basic socket operations
 * 
 **/
const io = require('socket.io')(server);

io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;

  if (!userId) {
    return next(new Error('Authentication error'));
  }
  // Attach just the user ID to the socket
  socket.userId = userId;
  next();
});

const userSocketMap = {};

io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;

  if (!userId) {
    return socket.disconnect(true);
  }

  userSocketMap[userId] = socket.id;
  console.log(`User ${userId} connected`);

  // Handle sending messages
  socket.on('send-message', async (data) => {
    const { listingId, receiverId, message } = data;
    const senderId = socket.userId;

    try {
      // Save to database
      const { sendMessage } = require('./database/queries/messagesQueries');
      await sendMessage(listingId, senderId, receiverId, message);

      // Forward to recipient if online
      const recipientSocketId = userSocketMap[receiverId];
      if (recipientSocketId) {
        // Get listing name
        const [listings] = await pool.query(
          'SELECT listing_name FROM listings WHERE listing_id = ?',
          [listingId]
        );

        // Get sender name
        const [senders] = await pool.query(
          'SELECT firstName, lastName FROM users WHERE user_id = ?',
          [senderId]
        );

        io.to(recipientSocketId).emit('receive-message', {
          senderId,
          senderName: senders.length > 0 ? `${senders[0].firstName} ${senders[0].lastName}` : 'Unknown',
          listingId,
          listingName: listings.length > 0 ? listings[0].listing_name : 'Listing',
          message,
          timestamp: new Date()
        });
      }

      // Send confirmation to sender
      socket.emit('message-sent', {
        success: true,
        message: 'Message sent successfully'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });
  //Disconnect from the server
  socket.on('disconnect', () => {
    delete userSocketMap[userId];
    console.log(`User ${userId} disconnected`);
  });
});



// Start the server with database connection
const startServer = async () => {
  try {
    // Connect to database first
    connectToDatabase();

    // Then start the server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Run the server
startServer();