import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";

//get all Courses

export const getAllCourse=async(req , res)=>{
    try {
        const courses = await Course.find({isPublished:true}).select
        (['-courseContent','-enrolledStudents']).populate({path:'educator'}) //coursecontent aur enrolledStudent ko nhi lena hai

        res.json({success:true,courses})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

//get course by Id 

export const getCourseId=async(req , res)=>{
    const {id}=req.params
     try {
        const courseData= await Course.findById(id).populate({path:'educator'})

        //remove lectureUrl if ispreviewfree is false 
        courseData.courseContent.forEach(chapter=>{
            chapter.chapterContent.forEach(lecture=>{
                if(!lecture.isPreviewFree)
                {
                    lecture.lectureUrl="";
                }
            })

        })
        res.json({success:true, courseData})
        
     } catch (error) {
        res.json({success:false, message:error.message})
        
     }
}

