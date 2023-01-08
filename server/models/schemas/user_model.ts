import mongoose from "mongoose";
import { genSalt, hash, compare } from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    last_name: {
      type: String,
      required: [true, "last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Passsword is required"],
      select: false,
      minLength: [6, "Password must be up to 6 characters long"],
      trim: true,
    },
    photo: {
      type: String,
      required: [true, "Please add a photo"],
      default: "https://a0.muscache.com/defaults/user_pic-50x50.png?v=3",
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      maxLength: [250, "Bio must not be more than 250 characters"],
      default: "Bio",
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      trim: true,
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

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp: any) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      //@ts-ignore
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model("user", userSchema);

export default User;
