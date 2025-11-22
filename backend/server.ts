import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import authRoutes from "./routes/auth.route";
import { connectDB } from "./lib/db";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use("api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
});
