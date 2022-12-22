import mongoose from "mongoose";
import { validateEmail } from "../../service/auth_service";
import { GlobalError } from "../../utils/global_error";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Passsword is required"],
      select: false,
      minLength: [6, "Password must be up to 6 characters long"],
    },
    photo: {
      type: String,
      required: [true, "Please add a photo"],
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    phone: {
      type: String,
      default: "+234",
    },
    bio: {
      type: String,
      maxLength: [250, "Bio must not be more than 250 characters"],
      default: "Bio",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    verificationCode: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    userAgent: {
      type: Array,
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

export default User;
