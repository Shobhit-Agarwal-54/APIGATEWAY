const express=require("express");
const axios=require("axios");
const morgan = require("morgan");
const {createProxyMiddleware}=require("http-proxy-middleware");
const rateLimit=require("express-rate-limit");

const app=express();
const PORT=3005;
const limiter=rateLimit({
    windowMs:2*60*1000, //2minutes
    max:5
});

app.use(morgan("combined"));
// We first hit morgan that is why we log the request and then 
// we add the limiter so request doesn't get processed
app.use(limiter);
// Morgan package is used for logging which helps in debugging the code
// Logging means getting the details of the body which sends the request like 
// Request method , IP Address, .....

app.use("/bookingservice",async (req,res,next)=>{
    console.log(req.headers['x-access-token']);
    try {
        const response=await axios.get("http://localhost:3001/api/v1/isAuthenticated",{
            headers:{
                'x-access-token':req.headers['x-access-token']
            }
        });
        console.log(response.data);
        if(response.data.success)
            {
                next();
                // Calling the next middleware 
            }
        else
        {
            return res.status(401).json({
                message:"Unauthorised"
            });
        }
        
    }
     catch (error) {
        return res.status(500).json({
            message:"Error in axios "
        });
    }
});

app.use("/bookingservice",createProxyMiddleware({
    target:"http://localhost:3002/",
    changeOrigin:true
}));
// /test will be removed and will be replaced by http://localhost:3002/

app.get("/home",(req,res)=>{
    return res.json({
        message:"OK"
    })
});

app.listen(PORT,()=>{
    console.log(`Server started at port ${PORT}`);
});