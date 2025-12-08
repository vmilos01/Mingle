const express = require('express')

const app = express()


app.get('/', function (req, res) {
  res.status(200).send({"Message": "The Mingle is real!"});
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
})

module.exports = app