import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from "../../context/AppContext"
import { useParams, useNavigate } from 'react-router-dom'
import { assets } from "../../assets/assets"
import humanizeDuration from 'humanize-duration'
import YouTube from 'react-youtube'
import Footer from '../../components/student/Footer'
import Rating from '../../components/student/Rating'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../../components/student/Loading'

const formatDuration = (duration) => {
  return humanizeDuration(duration * 60 * 1000, { 
    round: true,
    largest: 2,
    units: ["h", "m", "s"]
  })
}

const Player = () => {
  const navigate = useNavigate()

  const { enrolledCourses, calculateChapterTime, backendUrl, getToken, userData, fetchUserEnrolledCourses } = useContext(AppContext)


  const { courseId } = useParams()
  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [playerData, setPlayerData] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [initialRating, setInitialRating] = useState(0)

  const getCourseData = () => {
    const course = enrolledCourses.find((course) => course._id === courseId)
    if (course) {
      setCourseData(course)
      course.courseRatings.map((item)=>{
        if(item.userId === userData._id)
        {
          setInitialRating(item.rating)
        }
       
      })
    }
  }

  const toggleSection = (index) => {
    setOpenSections((prevState) => ({
      ...prevState,
      [index]: !prevState[index]
    }))
  }

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseData()
    }
  }, [enrolledCourses])

  //function to mark any lectures as completed

  const markLectureAsCompleted = async (lecuterId) =>{
     try {
       
      const token = await getToken()
      const {data} = await axios.post(backendUrl + '/api/user/update-course-progress',
        {courseId, lectureId}, {headers: {Authorization : `Bearer ${token}`}}
      ) //update karna hai to lectureId ko paas ki hain courseId ke saath
     

      //is function me to mark lecture as complete ka to kuch hai hi nhi hai
      if(data.success)
      {
         toast.success(data.message)
         getCourseProgress()  //we are getting the updated course progress data
      }
      else{
        toast.error(data.message)
      }


     } catch (error) {
      toast.error(error.message)
      
     }
  }

  //getCourse Progress function 
  const getCourseProgress = async () =>{
     try {
       const token = await getToken()
       const {data} = await axios.post(backendUrl + '/api/user/get-course-progress',
        {courseId}, {headers: {Authorization : `Bearer ${token}`}}
       )

       if(data.success)
       {
          setProgressData(data.progressData)
       }
       else{
         toast.error(data.message)
       }

     } catch (error) {
      toast.error(error.message)
      
     }
  }

  //rating any course 
   
  const handleRate = async(rating) =>{
    try {
       const token = await getToken()
       const {data} = await axios.post(backendUrl + '/api/user/add-rating',{courseId, rating},
        {headers:{ Authorization : `Bearer ${token}`}}
       )  //since we want to update the rating so along with courseId we passed rating also

       if(data.success)
       {
          toast.success(data.message)
          fetchUserEnrolledCourses()
       }
       else{
        toast.error(data.message)
       }

    } catch (error) {
      toast.error(error.message)
      
    }
  }

  useEffect(()=>{
      getCourseProgress()
  },[])





  return courseData ? (
    <>
      <div
        className="p-4 sm:p-10 flex
    flex-col-reverse md:grid md:grid-cols-2 gap-10
    md:px-36"
      >
        {/* left column */}
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold">Course Structure</h2>
          <div className="pt-5">
            {courseData && courseData.courseContent.map((chapter, index) => (
              <div
                key={index}
                className="border border-gray-300 bg-white mb-2 rounded overflow-hidden"
              >
                <div
                  className="flex items-center justify-between px-4 py-3
                        cursor-pointer select-none"
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex items-center gap-2">
                    <img
                      className={`transform transition-transform ${
                        openSections[index] ? "rotate-180" : ""
                      }`}
                      src={assets.down_arrow_icon}
                      alt="arrow icon"
                    />
                    <p className="font-medium md:text-base text-sm">
                      {chapter.chapterTitle}
                    </p>
                  </div>
                  <p className="text-sm md:text-default">
                    {chapter.chapterContent.length} lecture
                    {chapter.chapterContent.length !== 1 ? "s" : ""} -{" "}
                    {calculateChapterTime(chapter)}
                  </p>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300
                        ${openSections[index] ? "max-h-96" : "max-h-0"}`}
                >
                  <ul
                    className="list-disc md:pl-10 pl-4 pr-4
                          py-2 text-gray-600
                          border-t border-gray-300"
                  >
                    {chapter.chapterContent.map((lecture, i) => (
                      <li key={i} className="flex items-start gap-2 py-1">
                        <img
                          src={progressData && progressData.lectureCompleted.includes(lecture.lectureId)  ? assets.blue_tick_icon:assets.play_icon}
                          alt="play icon"
                          className="w-4 h-4 mt-1"
                        />
                        <div
                          className="flex items-center justify-between w-full
                                  text-gray-800 text-xs md:text-default"
                        >
                          <p className="font-medium">{lecture.lectureTitle}</p>
                          <div className="flex gap-2">
                            {lecture.lectureUrl && (
                              <p
                                onClick={() =>
                                  setPlayerData({
                                    ...lecture,chapter:index+1,lecture:i+1
                                  })
                                }
                                className="text-blue-500 cursor-pointer"
                              >
                                Watch
                              </p>
                            )}
                            <span>
                              {formatDuration(lecture.lectureDuration)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
           <div className='flex items-center gap-2 py-3 mt-10'>
               <h1 className='text-xl font-bold'>Rate this Course:</h1>
               <Rating initialRating={initialRating} onRate = {handleRate} />
            </div>
        </div>
        

        {/* right column */}
        <div className='md:mt-10'>
          {playerData ?(
            <div>
              <YouTube
                videoId={playerData.lectureUrl.split('/').pop()}
                iframeClassName="w-full aspect-video " /> 
              <div className='flex justify-between items-center mt-1'>
                  <p>
                    {playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}
                  </p>
                  <button onClick={()=>markLectureAsCompleted(playerData.lectureId)} className='text-blue-600'>{progressData && progressData.lectureCompleted.includes(playerData.lectureId) ? 'Completed':'Mark Complete'}</button>
              </div>
            </div>
            
          ):
          <img src={courseData ? courseData.courseThumbnail : ''} alt="Course Thumbnail" className="w-full rounded mb-4" />
          }
        </div>
      </div>
      <Footer />
    </>
  ):<Loading />;
};

export default Player;
