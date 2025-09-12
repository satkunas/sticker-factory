const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'app', 'dist')))

// Handle client-side routing - serve index.html for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app', 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`🚀 Sticker Factory server running on http://localhost:${PORT}`)
  console.log(`📁 Serving files from: ${path.join(__dirname, 'app', 'dist')}`)
})