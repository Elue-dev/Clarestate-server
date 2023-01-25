import Cryptr from "cryptr";

export const cryptr = new Cryptr("process.env.CRYPTR_KEYasstring");

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
