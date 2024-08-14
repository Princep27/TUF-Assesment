const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const port = process.env.PORT || 9000;
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "*",  // Allow all origins
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});


app.use(express.json());
app.use(cors());


const connection = mysql.createConnection({
    host: process.env.DBHOST, 
    port: process.env.DBPORT,  
    user: process.env.DBUSER,  
    password: process.env.DBPASSWORD,  
    database: process.env.DBDATABASE,  
    ssl: {
      rejectUnauthorized: false 
    }
});


connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + connection.threadId);
});

app.get('/dashboard', (req, res) => {
    connection.query('SELECT * FROM schema_table', (err, result) => {
        if (err) throw err;
        res.json(result[0]);
    });
});

app.put('/dashboard', (req, res) => {
    const { link, duration, description, visibility } = req.body;
    console.log(req.body);

    // Validate input
    if (typeof link !== 'string' || typeof duration !== 'number' || typeof description !== 'string') {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    // SQL query to update the record
    const query = 'UPDATE schema_table SET url = ?, duration = ?, description = ?, visibility = ?';

    connection.query(query, [link, duration, description, visibility], (err, results) => {
        if (err) {
            console.error('Error updating data:', err.stack);
            res.status(500).json({ error: 'Error updating data' });
            return;
        }

        // Check if any rows were affected
        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Record not found' });
        } else {
            // Fetch the updated data
            connection.query('SELECT * FROM schema_table', (err, updatedResults) => {
                if (err) {
                    console.error('Error querying updated table data:', err.stack);
                    res.status(500).json({ error: 'Error querying updated data' });
                    return;
                }

                // Broadcast the updated data to all WebSocket clients
                io.emit('update', updatedResults);

                res.status(200).json({ message: 'Data updated successfully' });
            });
        }
    });
});

io.on('connection', (socket) => {
    console.log('Client connected');

    // Send initial data when a client connects
    connection.query("SELECT * FROM schema_table", (err, results) => {
        if (err) {
            console.error('Error querying table data:', err.stack);
            socket.emit('error', { error: err.message });
        } else {
            socket.emit('initialData', results);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    socket.on('error', (error) => {
        console.error('Socket.io error:', error);
    });
}); 

server.listen(port, () => {
    console.log(`Server is running`);
});



/*-----------------------------------------------------------------------------------
create table
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS schema_table (
      id INT AUTO_INCREMENT PRIMARY KEY,
      url TEXT NOT NULL,
      duration INT NOT NULL,
      description TEXT NOT NULL
    );
  `;

  // Execute the query
  connection.query(createTableQuery, (err, results) => {
    if (err) {
      console.error('Error creating table:', err.stack);
      return;
    }
    console.log('Table created or already exists.');

    // Close the connection when done
    connection.end();
  });

insert data
const insertQuery = `
    INSERT INTO schema_table (url, duration, description, visibility)
    VALUES (?, ?, ?, ?);
    `;
    // Data to insert
    const data = [
        'https://takeuforward.org/',
        10,
        'Best Course Available on Internet',
        true
    ];
    // Execute the query
    connection.query(insertQuery, data, (err, results) => {
    if (err) {
        console.error('Error inserting data:', err.stack);
        return;
    }
    console.log('Data inserted successfully. Insert ID:', results.insertId);
});



Delete all rows
connection.query('DELETE FROM schema_table;', (err, results) => {
    if (err) {
      console.error('Error deleting rows:', err.stack);
      return;
    }
    console.log('All rows deleted successfully.');
    connection.end();  // Close the connection when done
  });


display data
const selectDataQuery = 'SELECT * FROM schema_table;';

  connection.query(selectDataQuery, (err, results) => {
    if (err) {
      console.error('Error querying table data:', err.stack);
      return;
    }
    console.log('Table data:');
    console.table(results);  // Display table data in a readable format
    connection.end();  // Close the connection when done
});

----------------------------------------------------------------------------------
*/