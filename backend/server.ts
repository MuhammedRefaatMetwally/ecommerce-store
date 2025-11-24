import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import authRoutes from "./routes/auth.route";
import productRoutes from "./routes/product.route";
import { connectDB } from "./lib/db";
import { errorHandler } from "./middleware/errorHandler.middleware";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(errorHandler)
app.use("/api/auth", authRoutes);
app.use("/api/products",productRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
});
