const cookieParser = require('cookie-parser')
const express = require('express')
const connectDB = require('./config/connectDB')
const seedDefaultAdmin = require('./utils/seedAdmin')
const morgan = require('morgan') 
const helmet  = require('helmet') 
const cors = require('cors')
const UserRouter = require('./routes/userRoutes')
const uploadRouter  = require('./routes/uploadImageRouter')
const productRouter = require('./routes/productRoutes')
const categoryRouter = require('./routes/categoryRoutes')
const subCategoryRouter = require('./routes/subCategoryRoutes')
const addressRouter = require('./routes/addressRoutes')
const cartRouter = require('./routes/cartRoutes')
require('dotenv').config()
const app = express()



app.use(cors({
    credentials : true, 
    origin : process.env.FRONTEND_URL
}))

app.use(express.json())
app.use(cookieParser()) 
app.use(morgan())
app.use(helmet({
    CrossOriginResourcePolicy : false
}))
connectDB().then(() => {
    seedDefaultAdmin()
})

const PORT = process.env.PORT || 3001

app.get('/', (req,res)=>{
    console.log('hello')
    res.json({
        message : "Ecommerce Backend Server is Running",
        PORT : PORT
    })
})

// Routes
app.use('/api/user' ,       UserRouter)
app.use('/api/product',     productRouter)
app.use('/api/category',    categoryRouter )
app.use('/api/subcategory', subCategoryRouter)
app.use('/api/address',     addressRouter)
app.use('/api/cart',        cartRouter)
app.use('/api',             uploadRouter)





app.listen(PORT, ()=>{
    console.log("Server is Running", PORT)
})