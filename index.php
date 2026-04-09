<?php
/**
 * Main index - Redirects to React frontend or API
 */

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// API routes
if (strpos($requestUri, '/api/') !== false) {
    // Let the API file handle it
    return false;
}

// Serve React frontend
header('Content-Type: text/html');
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pre-Enrollment System</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script>
        // This would normally be served by the React development server
        // For production, build the React app and serve it here
        document.write(
            '<p style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">' +
            'Please run the React development server:<br/><br/>' +
            '<code>cd frontend && npm install && npm start</code>' +
            '</p>'
        );
    </script>
</body>
</html>
