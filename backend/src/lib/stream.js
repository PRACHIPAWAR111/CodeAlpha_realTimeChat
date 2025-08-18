import{StreamChat} from "stream-chat";
 import "dotenv/config"

 const apiKey =  process.env.BOLBOL_API_KEY;
 const apiSecret = process.env.BOLBOL_API_SECRET;

 if (!apiKey || !apiSecret){
     console.error("Stream API key and Secret is missing");
 }
 
 const streamClient = StreamChat.getInstance(apiKey, apiSecret);
 export const upsertStreamUser = async (userData) =>{
    try{
        await streamClient.upsertUsers([userData]);
        return userData;
    }catch(error){

        console.error("Error upserting Stream user:", error);
    }
};

 export const generateStreamToken =(userID) =>{
    try {
        // ensure userID is a string 
        const userIdStr = userID.toString();
        return streamClient.createToken(userIdStr);
    } catch (error) {
        console.log('Error in getStreamToken controller:', error.message);
        res.status(500).json({ message: "Failed to generate token" });
    }
    
 };
