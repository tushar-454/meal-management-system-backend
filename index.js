const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 4000;
// middleware
app.use(express.json());
app.use(cors());

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

    // database colleciton
    const allMealCollection = client
      .db('meal-minder-pro')
      .collection('allMeal');

    // all api end point for save data in database

    // get all meal from database api end point
    app.get('/api/v1/user/all-meal', async (req, res) => {
      const { uid, date } = req.query;
      try {
        // get all meal by user uid
        if (uid) {
          const allMealArr = await allMealCollection.find().toArray();
          const uidAllMeal = allMealArr.filter(
            (singleMeal) => Object.keys(singleMeal)[0] === uid
          );
          // get one meal by user uid and date
          if (date) {
            const uidOneMealByDate = uidAllMeal.filter(
              (singleMeal) => singleMeal[uid].date === date
            );
            return res.send(uidOneMealByDate);
          }
          return res.send(uidAllMeal);
        }
      } catch (error) {
        console.log(error.message);
      }
      const result = await allMealCollection.find().toArray();
      res.send(result);
    });

    // add a meal in database api end point
    app.post('/api/v1/user/add-meal', async (req, res) => {
      const { uid, date, breackfast, launch, dinner } = req.body;
      const mealInfo = {
        [uid]: {
          date,
          breackfast,
          launch,
          dinner,
        },
      };
      try {
        const result = await allMealCollection.insertOne(mealInfo);
        res.send(result);
      } catch (error) {
        console.log(error.message);
      }
    });

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
