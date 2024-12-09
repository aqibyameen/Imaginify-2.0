import mongoose, {Mongoose} from 'mongoose'
const MONGODB_URLl=process.env.MONGODB_URL
interface MongooseConnection{
    conn:Mongoose | null;
    promise:Promise<Mongoose> | null;
}
let cached :MongooseConnection=(global as any).mongoose;
if(!cached){
    cached=(global as any)={conn:null,promise:null};
}
export const connectToDatabase= async ()=>{
    if(cached.conn){
        console.log("Connecting to database")
        return cached.conn;
    }
    if(!MONGODB_URLl) throw new Error("Missing MongoDB URL");
        cached.promise=cached.promise || mongoose.connect(MONGODB_URLl,{
    dbName:"Imaginify",
    bufferCommands:false
        })
        cached.conn=await cached.promise;
        return cached.conn; 
}