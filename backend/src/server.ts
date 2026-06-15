import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRouter from './routes/auth.routes'
import homeRouter from './routes/home.routes'
import adminRouter from './routes/admin.routes'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

mongoose.connect('mongodb://127.0.0.1:27017/Projekat')
const connection = mongoose.connection
connection.once('open', () => {
    console.log("Db connection ok")
})

const router = express.Router()
router.use("/auth", authRouter)
router.use("/home", homeRouter)
router.use("/admin", adminRouter)

app.use("/api", router)
app.listen(4000, () => console.log("Express running on port 4000!"))
