const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 4000;
// middleware
app.use(express.json());

// database connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@meal-minder-pro.rsrce6d.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    // all api end point for save data in database

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send({ message: 'Api is working.' });
});
app.get('/health', (req, res) => {
  res.send({ message: 'Server is running fine' });
});

app.listen(port, () => {
  console.log(`Server is working http://www.localhost:${port}`);
});
