import {Webhook} from "svix"
import User from "../models/User.js"
import { MongoDBAWS } from './../node_modules/mongodb/src/cmap/auth/mongodb_aws';


export const clerkWebhooks=async(req , res)=>{
    try {
        const whook=new Webhook(process.env.CLERK_WEBHOOK_SECRET) //create new webhook
       //wait for verification of that webhook created
        await whook.verify(JSON.stringify(req.body),
    {
         "svix-id" :req.headers["svix-id"],
         "svix-timestamp":req.headers["svix-timestamp"],
         "svix-signature":req.headers["svix-signature"]
    })
    //if verified fetch data and type from req.body
    const {data,type}=req.body

    switch (type) {
        case 'user.created':{ //if type is user.created
            //fetch the data of user created
            const userData={
                _id:data.id,
                email:data.email_addresses[0].email_address,
                name:data.first_name + " " + data.last_name,
                imageUrl:data.image_url,
            }
            // store the userdata created in MongoDB
            await User.create(userData)
            res.json({}) //why this???????????
            break;
        }
            
         case 'user.updated':{
            const userData={
                email:data.email_addresses[0].email_address,
                name:data.first_name + " " + data.last_name,
                imageUrl:data.image_url,
            }
            await User.findByIdAndUpdate(data.id,userData) //find by data.id and update with userData
            res.json({})
            break;
         }

         case 'user.deleted':
            {
                await User.findByIdAndDelete(data.id)
                res.json({})
                break;
            }
    
        default:
            break;
    }
    
        
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}


