import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import Loading from './../../components/student/Loading';
import axios from 'axios';
import { toast } from 'react-toastify'; // if you use toast

const MyCourses = () => {
  const { currency, backendUrl, getToken, isEducator } = useContext(AppContext);

  const [courses, setCourses] = useState([]);           // start as array
  const [loading, setLoading] = useState(false);

  const fetchEducatorCourses = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/educator/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('fetchEducatorCourses response:', data);

      // Normalize response to an array (check likely keys)
      let coursesArray = [];
      if (Array.isArray(data)) coursesArray = data;
      else if (Array.isArray(data.success)) coursesArray = data.success;
      else if (Array.isArray(data.courses)) coursesArray = data.courses;
      else if (Array.isArray(data.data)) coursesArray = data.data;
      else if (Array.isArray(data.payload)) coursesArray = data.payload;
      // fallback to empty array

      setCourses(coursesArray);
    } catch (error) {
      console.error('Error fetching educator courses:', error);
      toast?.error(error.response?.data?.message || error.message || 'Failed to fetch courses');
      setCourses([]); // ensure it's an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEducator) fetchEducatorCourses();
    // If `isEducator` can change shortly after mount, keep dependency
  }, [isEducator]);

  if (loading) return <Loading />;

  // If no courses
  if (!Array.isArray(courses) || courses.length === 0) {
    return (
      <div className='p-8'>
        <h2 className='text-lg font-medium'>My Courses</h2>
        <p className='mt-4'>You have not created any courses yet.</p>
      </div>
    );
  }

  return (
    <div className='h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div className='w-full'>
        <h2 className='pb-4 text-lg font-medium'>My Courses</h2>
        <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
          <table className='md:table-auto table-fixed w-full overflow-hidden'>
            <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
              <tr>
                <th className='px-4 py-3 font-semibold truncate'>All Courses</th>
                <th className='px-4 py-3 font-semibold truncate'>Earnings</th>
                <th className='px-4 py-3 font-semibold truncate'>Students</th>
                <th className='px-4 py-3 font-semibold truncate'>Published On</th>
              </tr>
            </thead>
            <tbody className='text-sm text-gray-500'>
              {courses.map((course) => (
                <tr key={course._id} className='border-b border-gray-500/20'>
                  <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate'>
                    <img src={course.courseThumbnail || '/placeholder.png'} alt='Course Image' className='w-16' />
                    <span className='truncate hidden md:block'>
                      {course.courseTitle || 'Untitled Course'}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    {currency}
                    {Math.floor(
                      (course.enrolledStudents?.length || 0) *
                        ((course.coursePrice || 0) - ((course.discount || 0) * (course.coursePrice || 0) / 100))
                    )}
                  </td>
                  <td className='px-4 py-3'>{course.enrolledStudents?.length || 0}</td>
                  <td className='px-4 py-3'>
                    {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
