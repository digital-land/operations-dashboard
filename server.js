const express = require('express')
const path = require('path')
const app = express()

app.use('/operations-dashboard', express.static(path.join(__dirname, 'docs')))
app.use('/content-frontend', express.static(path.join(__dirname, 'content-frontend/docs')))
app.listen(8080)
