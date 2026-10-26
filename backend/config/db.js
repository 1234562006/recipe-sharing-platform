const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === 'your_mongodb_connection_string') {
    const errorMsg =
      'MONGODB_URI is not configured in .env. Please configure your MongoDB Atlas connection string.';
    console.error(`\x1b[31m[Database Error]\x1b[0m ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(
      `\x1b[32m[Database]\x1b[0m MongoDB Connected successfully: ${conn.connection.host} (DB: ${conn.connection.name})`
    );
    return conn;
  } catch (err) {
    console.error(`\x1b[31m[Database Connection Failed]\x1b[0m ${err.message}`);
    console.error(
      '\x1b[33m[Troubleshooting Tip]\x1b[0m In MongoDB Atlas, verify:\n' +
      '  1. Network Access: Ensure your IP or 0.0.0.0/0 is whitelisted in MongoDB Atlas.\n' +
      '  2. Database Access: Ensure the DB username and password in MONGODB_URI are correct.\n' +
      '  3. Database Name: Ensure a database name is specified before the query parameters.'
    );
    throw err;
  }
};

module.exports = connectDB;
