import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js';


//Initialize Express
const app=express()

//connect to database 
await connectDB()

//Middlewares
app.use(cors())

//Routes
app.get('/',(req , res)=>res.send("API Working"))

//Port 
const PORT=process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})