import express from 'express'
import { bookAppointment, cancelAppointment, getProfile, listAppointment, loginUser, registerUser, updateProfile } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)

userRouter.get('/get-profile', authUser, getProfile)
userRouter.post('/update-profile', upload.single('image'), authUser, updateProfile)
userRouter.post('/book-appointment', authUser, bookAppointment)

userRouter.get('/list-appointment', authUser, listAppointment)
userRouter.delete('/cancel-appointment/:appointmentId', authUser, cancelAppointment);






export default userRouter
