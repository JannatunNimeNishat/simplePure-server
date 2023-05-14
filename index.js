const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())

//dovenv
require('dotenv').config()


//mongodb

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oth2isl.mongodb.net/?retryWrites=true&w=majority`;

//jwt
const jwt = require('jsonwebtoken');





// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        // services
        const servicesCollection = client.db('smilePureDB').collection('services')
        // appointment
        const appointmentCollection = client.db('smilePureDB').collection('appointment')


                // jwt 
        //jwt token create for every valid user after login
        app.post('/jwt', (req,res)=>{
            // console.log('inside jwt');
            const user = req.body;
            const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET, {expiresIn:'1h'})
            // console.log(token);
            res.send({token});
        })



                      //CRUD for services
 
        //read
        app.get('/services', async (req, res) => {

            /*   const option = { 
                  projection: {service_name:1,img:1,details:1 }
              } */
            const cursors = servicesCollection.find()
            const result = await cursors.toArray();
            console.log(result);
            res.send(result);
        })


        //read specific service 
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) }
            const option = {
                projection: {doctor_name: 1,doctor_img: 1, details: 1,price: 1, service_name:1,img:1}
            }
            const result = await servicesCollection.findOne(query,option)
            res.send(result);
        })

            //CRUD Appointment
        //create
        app.post('/appointment', async(req,res)=>{
            const newAppointment = req.body;
            const result = await appointmentCollection.insertOne(newAppointment);
            res.send(result);
        })

        //read a specific users appointments
        app.get('/appointments', async(req,res)=>{
           
             let query = {}
            if(req.query?.email){
                query = {email: req.query.email};
            }

            const result = await appointmentCollection.find(query).toArray();
            res.send(result);

        })

        //delete a appointment
        app.delete('/appointments/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await appointmentCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('simplePure server is running')
})



app.listen(port, () => {
    console.log(`smilePure running at port: ${port}`);
})