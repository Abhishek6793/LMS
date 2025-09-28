import User from "../models/User.js"
import Purchase from "../models/Purchase.js";
import Stripe from "stripe";
import Course from "../models/Course.js";
import { CourseProgress } from './../models/CourseProgress.js';



//get user data
export const getUserData= async(req , res)=>{
    try {
        const userId=req.auth.userId
        const user=await User.findById(userId)

        if(!user)
        {
            return res.json({success:false,message:'User not found'})
        }
        res.json({success:true, user})
    } catch (error) {

        res.json({success:false,message:error.message})
        
    }
}

//Users Enrolled Courses with lecture Links

export const userEnrolledCourses = async(req , res)=>{
    try {
        const userId = req.auth.userId
        const userData = await User.findById(userId).populate('enrolledCourses')

        res.json({success:true, enrolledCourses: userData.enrolledCourses})

    } catch (error) {
        res.json({success:false, message:error.message})
        
    }
}

//Purchase Courses 
export const purchaseCourse = async (req,res )=>{
    try {
        const {courseId}=req.body
        const {origin}=req.headers
        const userId=req.auth.userId
        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)

         if(!userData || !courseData)
         {
           return res.json({success:false, message:'Data Not found'})
         }
         //create purchasedata based on Purchase Schema means include all the things that are in Schema
         const  purchaseData = {
            courseId: courseData._id,
            userId,
            amount:(courseData.coursePrice - courseData.discount * courseData.coursePrice /100).toFixed(2),
         }

         //store the newpurchase in mongodb database
         const newPurchase= await Purchase.create(purchaseData)

         //Stripe Gateway Initialize
         const stripeInstance=new Stripe(process.env.STRIPE_SECRET_KEY)

         const currency= process.env.CURRENCY.toLowerCase()

         //creating line items to for Stripe
         const line_items=[{
            price_data:{
                currency,
                product_data:{
                    name:courseData.courseTitle
                },
                unit_amount:Math.floor(newPurchase.amount) * 100
            },
            quantity:1
         }]
          //creating a payment session
         const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}`,
            line_items: line_items,
            mode:'payment',
            metadata:{
                purchaseId: newPurchase._id.toString()
            }
         })

         res.json({success:true, session_url:session.url})



    } catch (error) {
        res.json({success:false, message:error.message})
    }
}

//update User course progress 
export const updateUserCourseProgress = async(req , res)=>{
    try {
        const userId = req.auth.userId
        const {courseId , lectureId} = req.body
        const progressData = await CourseProgress.findOne({userId, courseId})

        if(progressData)
        {
            if(progressData.lectureCompleted.includes(lectureId))
            {
                return res.json({success: true, message:'Lecture Already Completed'})
            }
            progressData.lectureCompleted.push(lectureId)
            await progressData.save()
        }
        else{
            //if there is no progress data then create one and add the neccessary fields

            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            })
        }
    } catch (error) {
        res.json({success:false, message: error.message})    
    }
}

// get User Course Progress 
export const getUserCourseProgress = async(req , res) =>{
    try {
        const userId= req.auth.userId
        const {courseId}=req.body
        const progressData = await CourseProgress.findOne({userId, courseId})
        res.json({success:true,progressData})
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}

//add user ratings to course 

export const addUserRating = async()=>{
    const userId = req.auth.userId;
    const {courseId, rating} =req.body;

    if(!courseId || !userId || !rating || rating <1 || rating>5)
    {
        return res.json({success: false , message: 'Invalid Details'});
    }
    try {
        const course = await Course.findById(courseId);

        if(!course)
        {
            return res.json({success:false, message:'Course not found.'});
        }
        const user = await User.findById(userId);
          
        if(!user || !user.enrolledCourses.includes(courseId))
        {
            return res.json({success:false, message:'User has not purchased this course.'});
        }

        const existingRatingIndex = course.courseRatings.findIndex(r=>r.userId === userId)
        
        if(existingRatingIndex > -1)
        {
            course.courseRatings[existingRatingIndex].rating = rating;
        }
        else{
            course.courseRatings.push({userId,rating});
        }
        await course.save();

        return res.json({success: true, message: 'Rating Added'})

    } catch (error) {
        return res.json({success: false , message: error.message})
    }
}



