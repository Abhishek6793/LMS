import express from 'express'
import { getAllCourse, getCourseId } from '../controllers/courseController.js';

const courseRouter=express.Router();

//adding endpoints

courseRouter.get('/all',getAllCourse)
courseRouter.get('/:id',getCourseId)

export default courseRouter;