import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import fs from 'fs'
import authRouter from './routes/auth.routes'
import homeRouter from './routes/home.routes'
import adminRouter from './routes/admin.routes'
import employeeRouter from './routes/employee.routes'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
app.use('/uploads', express.static(uploadsDir))

// Create default avatar if not present
const defaultAvatarPath = path.join(uploadsDir, 'default-avatar.svg')
if (!fs.existsSync(defaultAvatarPath)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="60" fill="#94a3b8"/>
  <circle cx="60" cy="44" r="20" fill="#ffffff"/>
  <ellipse cx="60" cy="98" rx="34" ry="26" fill="#ffffff"/>
</svg>`
    fs.writeFileSync(defaultAvatarPath, svg)
}

mongoose.connect('mongodb://127.0.0.1:27017/Projekat')
const connection = mongoose.connection
connection.once('open', () => {
    console.log("Db connection ok")
})

const router = express.Router()
router.use("/auth", authRouter)
router.use("/home", homeRouter)
router.use("/admin", adminRouter)
router.use("/employee", employeeRouter)

app.use("/api", router)
app.listen(4000, () => console.log("Express running on port 4000!"))
