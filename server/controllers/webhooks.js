import {Webhook} from "svix"
import User from "../models/User.js"
import { Stripe } from 'stripe';
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";


//API controller function to manage clerk user with database

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

//CREATING WEBHOOKS OF Stripe

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

export const stripeWebhooks = async(request, response)=>{
    const sig=request.headers['stripe-signature'];

    let event;

    try {
        event=Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        response.status(400).send(`webhook Error:${error.message}`);
    }

    //handle the event that we are getting above in try block

    switch (event.type) {
        case 'payment_intent.succeeded':{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent:paymentIntentId
            })

            const {purchaseId} = session.data[0].metadata;

            const purchaseData = await Purchase.findById(purchaseId)
            const userData = await User.findById(purchaseData.userId)
            const courseData = await Course.findById(purchaseData.courseId.toString()) 
            
            //userData to courseData because there is a purchase
            courseData.enrolledStudents.push(userData)
            await courseData.save()

            //add courseData to userdata 
            userData.enrolledCourses.push(courseData._id)
            await userData.save() //saving in mongodb database

            //since we are handling the event succeed we will update the status of payment to 'completed'
              purchaseData.status = 'completed'
              await purchaseData.save()

            break;
        }

        case 'payment_intent.payment_failed':{
             const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent:paymentIntentId
            })

            const {purchaseId} = session.data[0].metadata;
            const purchaseData = await Purchase.findById(purchaseId)
            
            purchaseData.status = 'failed'
            await purchaseData.save()

        break;}
       //.... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);

            
            
    }
    response.json({received: true});
    
}


