import mongoose,  { Mongoose } from "mongoose";

const connectDB = async ()=> {
    try{
        // MONGODB_URI already includes the target database name and query
        // params (e.g. ".../production?retryWrites=true&w=majority"), so it
        // must be used as-is. Appending a separate DB_NAME here used to
        // corrupt the write concern (it produced "w=majority/aatmanfoundation",
        // an invalid write concern name).
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected!, DB host ${(connectionInstance).connection.host} `)
    }catch(error){
        console.log("Mongoose connection error", error)
        process.exit(1);
    }
}

export default connectDB;