/**
 * Simple Express server.
 */

const express = require('express');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            // Allow media devices access for WebRTC
            mediaSrc: ["'self'", "blob:"],
            connectSrc: ["'self'", "blob:"],
            imgSrc: ["'self'", "data:", "blob:"]
        }
    }
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route all requests to index.html for client-side routing
app.get('.', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})
