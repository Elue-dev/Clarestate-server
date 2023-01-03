import mongoose from "mongoose";
import { genSalt, hash, compare } from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "First name is required"],
    },
    last_name: {
      type: String,
      required: [true, "last name is required"],
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
      default: "https://a0.muscache.com/defaults/user_pic-50x50.png?v=3",
    },
    phone: {
      type: String,
      default: "",
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
    codeExpires: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    userAgents: {
      type: Array,
      required: true,
      select: false,
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);

  next();
});

userSchema.methods.correctPassword = async function (
  providedPassword: string,
  userPassword: string
) {
  return await compare(providedPassword, userPassword);
};

const User = mongoose.model("user", userSchema);

export default User;
