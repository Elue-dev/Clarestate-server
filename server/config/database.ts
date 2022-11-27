import mongoose from "mongoose";

export const connectDatabase = async () => {
  const database = process.env.DATABASE;

  try {
    await mongoose.connect(database as string);

    console.log(`DATABASE CONNECTED SUCCESSFULLY!`);
  } catch (error) {
    console.log("DATABASE CONNECTION ERROR", error);

    process.exit(1);
  }
};
