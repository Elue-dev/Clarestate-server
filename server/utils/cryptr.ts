import Cryptr from "cryptr";

export const cryptr = new Cryptr("process.env.CRYPTR_KEYasstring");

// router.delete("/delete-me", deleteLoggedInUser);

// export const updateLoggedInUser = handleAsync(
//     async (req: Request, res: Response, next: NextFunction) => {
//       //@ts-ignore
//       const user = await User.findById(req.user._id);

//       const { username, email, bio, photo, phone } = req.body;

//       if (!user || !user.active) {
//         return next(new GlobalError("User not found", 404));
//       }

//       if (!username && !email && !bio && !phone && !photo) {
//         return next(
//           new GlobalError("Please provide fields you want to update", 400)
//         );
//       }

//       if (req.body.password) {
//         return next(
//           new GlobalError(
//             "This route is not for password updates. Please use the forgot password route",
//             400
//           )
//         );
//       }

//       const filteredBody = filteredObj(
//         req.body,
//         "username",
//         "email",
//         "photo",
//         "bio",
//         "phone"
//       );

//       const updatedUser = await User.findByIdAndUpdate(
//         //@ts-ignore
//         req.user._id,
//         filteredBody,
//         {
//           new: true,
//           runValidators: true,
//         }
//       );

//       res.status(200).json({
//         status: "success",
//         updatedUser,
//       });
//     }
// )

// router.patch("/update-me", updateLoggedInUser);

// userSchema.pre(/^find/, function (next) {
//   this.find({ active: { $ne: false } });

//   next();
// });

// import fs from "fs";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import { connectDatabase } from "../config/database";
// import Property from "../models/schemas/property_model";

// dotenv.config();

// const properties = JSON.parse(
//   fs.readFileSync(`${__dirname}/properties.json`, "utf-8")
// );

// const database = process.env.DATABASE;

// mongoose
//   .connect(database as string)
//   .then(() => console.log("DB Connected Successfully!"));

// const importData = async () => {
//   try {
//     await Property.create(properties);
//   } catch (error) {
//     console.log(error);
//   }
//   process.exit(1);
// };

// const deleteData = async () => {
//   try {
//     await Property.deleteMany();
//   } catch (error) {
//     console.log(error);
//   }
//   process.exit(1);
// };

// if (process.argv[2] === "--import") {
//   importData();
// } else if (process.argv[2] === "--delete") {
//   deleteData();
// }

// const cachedProperties = await redisClient.get("clarProp");

// if (cachedProperties) {
//   return res.status(200).json({
//     status: "success",
//     // results: cachedProperties.length,
//     properties: JSON.parse(cachedProperties),
//   });
// }

// await redisClient.set("clarProp", JSON.stringify(properties));

// export const getPropertyReviews = handleAsync(
//     async (req: Request, res: Response, next: NextFunction) => {
//       const { propertyID } = req.params;

//       const review = Review.findById(propertyID);

//       res.status(200).json({
//         status: "success",
//         review,
//       });
//     }
//   );

// export const deleteLoggedInUser = handleAsync(
//     async (req: Request, res: Response, next: NextFunction) => {
//       //@ts-ignore
//       const user = await User.findById(req.user._id).select("+active");

//       if (!user || !user.active) {
//         return next(new GlobalError("User not found", 404));
//       }

//       if (!user.active) {
//         return next(new GlobalError("User already deleted", 404));
//       }

//       user.active = false;

//       await user.save();

//       const subject = `Notification on deleted account`;
//       const send_to = user.email;
//       const sent_from = process.env.EMAIL_USER as string;
//       const reply_to = process.env.REPLY_TO as string;
//       const body = deleteAccount(user.first_name);

//       try {
//         sendEmail({ subject, body, send_to, sent_from, reply_to });
//         res.status(200).json({
//           status: "success",
//           message: "User sucessfully deleted",
//         });
//       } catch (error) {
//         res.status(500).json({
//           status: "fail",
//           message: `Email not sent. Please try again.`,
//         });
//       }
//     }
//   );
