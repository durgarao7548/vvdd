const express = require('express');
const bodyParser = require('body-parser');
const mssql = require('mssql');
const cors = require('cors'); // Import CORS

const app = express();
const port = 5000;

// Middleware for parsing JSON and handling CORS
app.use(cors());  // Allow cross-origin requests from any origin
app.use(bodyParser.json());

// SQL Server Configuration
const dbConfig = {
    user: 'sa', // Replace with your database username
    password: '@Durga123', // Replace with your database password
    server: 'localhost', // Replace with your server address if different
    database: 'UserLoginDB', // Replace with your database name
    options: {
        encrypt: true, // For secure connections
        trustServerCertificate: true, // For self-signed certificates
    },
};

// Login API
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // Connect to the SQL Server
        const pool = await mssql.connect(dbConfig);

        // Query the database
        const result = await pool
            .request()
            .input('Username', mssql.VarChar, username)
            .input('PasswordHash', mssql.VarChar, password)
            .query(`
                SELECT * FROM Users 
                WHERE Username = @Username 
                  AND PasswordHash = @PasswordHash
            `);

        // Check login result
        if (result.recordset.length > 0) {
            res.status(200).json({ success: true, message: 'Login successful.' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});
app.get('/api/getData', async (req, res) => {
    const { tableName } = req.query;
    console.log('Request received for table:', tableName);  // Log the table name

    if (!tableName) {
        return res.status(400).json({ success: false, message: 'Table name is required.' });
    }

    try {
        const pool = await mssql.connect(dbConfig);
        console.log('Database connected');

        const result = await pool
            .request()
            .query(`SELECT * FROM ${tableName}`);

        if (result.recordset.length > 0) {
            res.status(200).json({ success: true, data: result.recordset });
        } else {
            res.status(404).json({ success: false, message: 'No data found.' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

  