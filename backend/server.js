import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use("api/auth",authRoutes)
app.listen(PORT, () => {
  console.log("====================================");
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("====================================");
});
