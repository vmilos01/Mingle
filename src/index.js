const express = require('express')
const authenticateRouter = require('./routes/authenticate')
const postRouter = require('./routes/post')

require('dotenv').config()

const port = process.env.PORT || 3000;

const app = express()
app.use(express.json());
app.use("/user", authenticateRouter)
app.use("/post", postRouter)


app.get('/', function (req, res) {
  res.status(200).send({"Message": "The Mingle is real!"});
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})

module.exports = app