import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import "dotenv/config";
import authRoutes from "./routes/auth.route";
import productRoutes from "./routes/product.route";
import { errorHandler, notFound } from "./middleware/errorHandler.middleware";
import { connectDB } from "./lib/db";

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true, // Allow cookies
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use(compression());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.use(notFound);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(" Server is running on http://localhost:" + PORT);
      console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Catch unhandled promise rejections (missing .catch()) and shut down safely
process.on("unhandledRejection", (err: Error) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1); 
});

// Catch errors not wrapped in try/catch and shut down safely
process.on("uncaughtException", (err: Error) => {
  console.error("UNCAUGHT EXCEPTION!  Shutting down...");
  console.error(err.name, err.message);
  process.exit(1); 
});

// Handle graceful shutdown (e.g., from Docker, AWS, or system stop)
process.on("SIGTERM", () => {
  console.log(" SIGTERM received. Shutting down gracefully...");
  process.exit(0); 
});

startServer();

export default app;
