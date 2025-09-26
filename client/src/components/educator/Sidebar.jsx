import React, { useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import { NavLink, useLocation } from 'react-router-dom'
import { assets } from '../../assets/assets'

const MenuItem = ({ path, icon, name, isActive }) => (
  <NavLink
    to={path}
    end={path === '/educator'}
    className={`flex items-center md:flex-row flex-col md:justify-start 
      justify-center py-3.5 md:px-10 gap-3 transition-colors 
      ${isActive 
        ? 'bg-indigo-50 border-r-[6px] border-indigo-500/90 text-indigo-600 font-medium' 
        : 'hover:bg-gray-100/90 border-r-[6px] border-white hover:border-gray-100/90'}`}
  >
    <img src={icon} alt={name} className="w-6 h-6" />
    <span className="md:block hidden">{name}</span>
  </NavLink>
)

const Sidebar = () => {
  const { isEducator } = useContext(AppContext)
  const { pathname } = useLocation()

  const menuItems = [
    {name:'Dashboard',path:'/educator',icon:assets.home_icon},
    {name:'Add Course',path:'/educator/add-course',icon:assets.add_icon},
    {name:'My Courses',path:'/educator/my-courses',icon:assets.my_course_icon},
    {name:'Student Enrolled',path:'/educator/student-enrolled',icon:assets.person_tick_icon},
  ];

  return isEducator && (
    <aside className="md:w-64 w-16 border-r min-h-screen text-base border-gray-500 py-2 flex flex-col">
      {menuItems.map((item) => (
        <NavLink
          to={item.path}
          key={item.name}
          end={item.path === '/educator'}
          className={({ isActive }) => `
            flex items-center md:flex-row flex-col 
            md:justify-start justify-center py-3.5 md:px-10 gap-3
            border-r-[6px] transition-colors
            ${isActive 
              ? 'bg-indigo-50 border-indigo-500/90 text-indigo-600' 
              : 'hover:bg-gray-100/90 border-white hover:border-gray-100/90'
            }
          `}
        >
          <img 
            src={item.icon} 
            alt={`${item.name} icon`} 
            className="w-6 h-6"
          />
          <span className="md:block hidden text-center">
            {item.name}
          </span>
        </NavLink>
      ))}
    </aside>
)
}

export default Sidebar
