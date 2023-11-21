const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    // database and database collection
    const database = client.db('meal-minder-pro');
    const allMealCollection = database.collection('allMeal');
    const allMoneyCollection = database.collection('allMoney');
    const allCostCollection = database.collection('allCost');
    const userInfoCollection = database.collection('userInfo');

    // all api end point for save data in database

    // get all meal from database api end point
    app.get('/api/v1/user/all-meal', async (req, res) => {
      const { email, date } = req.query;
      try {
        const allMealArr = await allMealCollection
          .find()
          .sort({
            date: 1,
          })
          .toArray();
        // get all meal by user uid
        if (email) {
          const uidAllMeal = allMealArr.filter(
            (singleMeal) => singleMeal.email === email
          );
          // get one meal by user uid and date
          if (date) {
            const uidOneMealByDate = uidAllMeal.filter(
              (singleMeal) =>
                new Date(singleMeal.date).toLocaleDateString() === date
            );
            return res.send(uidOneMealByDate);
          }
          return res.send(uidAllMeal);
        }
        res.send(allMealArr);
      } catch (error) {
        console.log(error.message);
      }
    });

    // get all money api end point
    app.get('/api/v1/user/all-money', async (req, res) => {
      const { email, date, month } = req.query;
      try {
        const allMoneyArr = await allMoneyCollection.find().toArray();
        // get all money info by user email
        if (email) {
          const emailAllMoney = await allMoneyCollection
            .find({ email })
            .toArray();
          // get one moneyinfo by user uid and date
          if (date) {
            const emailOneMoneyByDate = emailAllMoney.filter(
              // todo best way to query
              (singleMoney) =>
                new Date(singleMoney.date).toLocaleDateString() === date
            );
            return res.send(emailOneMoneyByDate);
          }
          // get user email all money and one month data
          if (month) {
            const monthlyAllMoney = emailAllMoney.filter((singleMoney) => {
              const singleMoneyDate = new Date(singleMoney.date);
              return (
                `${
                  singleMoneyDate.getMonth() + 1
                }/${singleMoneyDate.getFullYear()}` === month
              );
            });
            return res.send(monthlyAllMoney);
            // todo
          }
          return res.send(emailAllMoney);
        }
        res.send(allMoneyArr);
      } catch (error) {
        console.log(error.message);
      }
    });

    // get all costing info from database api
    app.get('/api/v1/user/all-cost', async (req, res) => {
      const { email, date, type, monthYear } = req.query;
      if (email && !date && !type) {
        const result = await allCostCollection
          .find({ whoDoingBazarEmail: email })
          .toArray();
        return res.send(result);
      }
      if (!email && date && !type) {
        const result = await allCostCollection.find({ date }).toArray();
        return res.send(result);
      }
      if (!email && !date && type) {
        const result = await allCostCollection
          .find({ whatType: type })
          .toArray();
        return res.send(result);
      }
      if (!email && !date && !type && monthYear) {
        const allCosts = await allCostCollection.find().toArray();
        const monthlyCosts = [];
        allCosts.forEach((cost) => {
          const dateObj = new Date(cost.date);
          const date = `${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
          if (date === monthYear) {
            monthlyCosts.push(cost);
          }
        });
        return res.send(monthlyCosts);
      }
      const result = await allCostCollection.find().toArray();
      res.send(result);
    });

    // get all user basic info in database
    app.get('/api/v1/userInfo', async (req, res) => {
      const { email, accountStatus } = req.query;
      let query = {};
      if (email) query.email = email;
      if (accountStatus) query.accountStatus = accountStatus;
      if (email && accountStatus) query = { email, accountStatus };
      const result = await userInfoCollection.find(query).toArray();
      res.send(result);
    });

    // add a meal in database api end point
    app.post('/api/v1/user/add-meal', async (req, res) => {
      const { email, date, breackfast, launch, dinner, perDayTotal } = req.body;
      const isExists = await allMealCollection.findOne({
        email,
        date: new Date().toLocaleDateString(),
      });
      const isExistsNextMeal = await allMealCollection.findOne({
        email,
        date: `${new Date().getMonth() + 1}/${
          new Date().getDate() + 1
        }/${new Date().getFullYear()}`,
      });
      const newMealEntry = await allMealCollection.findOne({ email });
      if (isExists && new Date().getHours() < 20) {
        return res.send([
          {
            message:
              'Your todays meal already exists. Add your next meal between 08:00PM - 11:59PM',
          },
        ]);
      }
      if (isExistsNextMeal && new Date().getHours() > 19) {
        return res.send([{ message: 'Your next day meal already exists' }]);
      }
      if ((isExists && new Date().getHours() > 19) || !newMealEntry) {
        const mealInfo = {
          email,
          date,
          breackfast,
          launch,
          dinner,
          perDayTotal,
        };
        const result = await allMealCollection.insertOne(mealInfo);
        res.send(result);
      }
      if (!isExists) {
        return res.send([
          {
            message:
              "Can't find todays meal, first contact with manager or admin",
          },
        ]);
      }
    });

    // add money in database api end point
    app.post('/api/v1/user/add-money', async (req, res) => {
      const addMoneyInfo = req.body;
      try {
        const result = await allMoneyCollection.insertOne(addMoneyInfo);
        res.send(result);
      } catch (error) {
        console.log(error.message);
      }
    });

    // add a bazar cost list in database
    app.post('/api/v1/user/add-cost', async (req, res) => {
      const costDoc = req.body;
      const result = await allCostCollection.insertOne(costDoc);
      res.send(result);
    });

    // add user basic info in database
    app.post('/api/v1/userInfo', async (req, res) => {
      const userInfo = req.body;
      const result = await userInfoCollection.insertOne(userInfo);
      res.send(result);
    });

    // user add meal update api
    app.put('/api/v1/user/update-meal', async (req, res) => {
      const { id, email } = req.query;
      const filter = { _id: new ObjectId(id) };
      const { breackfast, launch, dinner, perDayTotal } = req.body;
      if (new Date().getHours() > 7 && new Date().getHours() < 20) {
        return res.send([
          { message: "Timeout, Can't update breackfast or launch meal now." },
        ]);
      }
      if (new Date().getHours() > 16 && new Date().getHours() < 20) {
        return res.send([{ message: "Timeout, Can't update any meal now." }]);
      }
      // just update dinner info
      if (new Date().getHours() > 13 && new Date().getHours() < 17) {
        const updatedMealDoc = {
          $set: {
            dinner,
            perDayTotal,
          },
        };
        const result = await allMealCollection.updateOne(
          filter,
          updatedMealDoc
        );
        return res.send(result);
      }
      // update brackfast or launch or dinner info
      if (
        (new Date().getHours() > 19 && new Date().getHours() >= 23) ||
        new Date().getHours() < 8
      ) {
        const updatedMealDoc = {
          $set: {
            breackfast,
            launch,
            dinner,
            perDayTotal,
          },
        };
        const result = await allMealCollection.updateOne(
          filter,
          updatedMealDoc
        );
        return res.send([{ message: 'Update successfully' }]);
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
