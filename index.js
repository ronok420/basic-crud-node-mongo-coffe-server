
// const express = require('express');

// const cors = require('cors');
// const app = express();
// require('dotenv').config();
// const port = process.env.PORT || 7000;




// //middleware   
// app.use(cors());
// app.use(express.json());



// const { MongoClient, ServerApiVersion } = require('mongodb');

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bwilrcc.mongodb.net/?retryWrites=true&w=majority`;


// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     const coffeCollection =client.db('coffeDb').collection('coffe');

//     app.post('/coffe', async (req, res) => {
//       const newCoffe = req.body;
//       console.log(newCoffe);
//       const result =await coffeCollection.insertOne(newCoffe);
//       res.send(result);
//     })





//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);





// app.get('/', (req, res) => {
//   res.send('coffe making server is running ')

// })
// app.listen(port, () => {
//   console.log(`coffe server port is running  at port ${port}`)
// })








const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bwilrcc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const coffeCollection = client.db('coffeDb').collection('coffe');



    app.delete('/coffe/:id', async(req,res) =>{
      const id=req.params.id;
      const query = {_id: new ObjectId(id)}
      const result=await coffeCollection.deleteOne(query)
      res.send(result);

    })
   app.get('/coffe',async(req,res)=>{
    const cursor=coffeCollection.find();
    const result=await cursor.toArray();
   
    res.send(result);


   })
    app.post('/coffe', async (req, res) => {
      try {
        const newCoffe = req.body;
        console.log(newCoffe);
        const result = await coffeCollection.insertOne(newCoffe);
    
        // if (result.ops && result.ops.length > 0) {
        //   res.json({ success: true, message: 'Coffee added successfully', data: result.ops[0] });
        // } else {
        //   res.status(500).json({ success: false, message: 'Failed to retrieve inserted data' });
        // }
        if (result.acknowledged && result.insertedId) {
          // Insertion was successful
          const insertedData = await coffeCollection.findOne({ _id: result.insertedId });
          
          if (insertedData) {
            res.json({ success: true, message: 'Coffee added successfully', data: insertedData });
          } else {
            console.log('Failed to retrieve inserted data:', result);
            res.status(500).json({ success: false, message: 'Failed to retrieve inserted data' });
          }
        } else {
          console.log('Failed to insert data:', result);
          res.status(500).json({ success: false, message: 'Failed to insert data' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    });
    

    app.get('/coffe/:id', async(req,res)=>{
      const id=req.params.id;
      const query= {_id: new ObjectId(id)}
      const result= await coffeCollection.findOne(query)
      res.send(result);

    })
    app.put('/coffe/:id', async(req,res)=>{
      const id=req.params.id;
      const filter= {_id : new ObjectId(id)}
      const options={upsert:true};
      const updateCoffe=req.body;
      const coffe={
        $set:{
          name: updateCoffe.name,
          quantity: updateCoffe.quantity,
          supplier:updateCoffe.supplier,
          taste: updateCoffe.taste,
          category: updateCoffe.category,
          details: updateCoffe.details,
          photoUrl: updateCoffe.photoUrl,
        }
      }
      const result=await coffeCollection.updateOne(filter,coffe,options);
      console.log("Coffe updated")
      res.send(result);

    })

    app.get('/', (req, res) => {
      res.send('Coffee making server is running');
    });

    app.listen(port, () => {
      console.log(`Coffee server is running at port ${port}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);
