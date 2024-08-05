import { dbConnect } from "@/configs/dbConfig";
import User from "@/models/userModel";
import {NextRequest,NextResponse} from "next/server"
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/utils/mailer";


 
export async function POST(req:NextRequest){ 
    try { 
       await dbConnect();
        const { username, email, password } =await req.json();
        // validation 
        const user = await User.findOne({ email });
        if (user) {
            return NextResponse.json({ error: "User already exists" },{status:400});
        }
        const hashedPassword = await bcryptjs.hash(password, 12);
        const newUser = new User({ username, email, password: hashedPassword });
        const res = await newUser.save();
        // send email
        await sendEmail({
                email:email,
                emailType: "VERIFY",
                userId: res._id,
            });
        return NextResponse.json({ message: "User created successfully",success:true,data:res },{status:201});
    } catch (error:any) { 
        return NextResponse.json({ error: error.message },{status:500});
    }
}