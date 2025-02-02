import { connect } from "mongoose"

export const connectDB = async () => {
    try {
        console.log('base de datos conectada')
        return  await connect('mongodb+srv://mgaunatesta:mansana123@cluster0.mwc2x.mongodb.net/pfbend?retryWrites=true&w=majority&appName=Cluster0')        
    } catch (error) {
        console.log(error)
    }
}
 