import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import db from './pgdb.js';
import cors from 'cors';
import multer from 'multer';
import authRouter from './routes/authRoute.js';
import userRouter from './routes/userRoute.js';
import categoryRouter from './routes/categoryRoute.js';
import productRouter from './routes/productRoute.js';
import adminRouter from './routes/adminRoute.js';
import cartRouter from './routes/cartRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import orderRouter from './routes/orderRoute.js';
import paymentRouter from './routes/paymentRoute.js';
import ingredientRouter from './routes/ingredientRoute.js';
import earlyBirdRouter from './routes/earlyBirdRoute.js';


const app = express();
app.set('trust proxy', 1);

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or postman)
      if (!origin) return callback(null, true);

      // Check if it's in the explicitly allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check if it is a localhost origin (for local development)
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Check if it is a Vercel deployment/preview origin
      if (
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.projects.vercel.app') ||
        /^https:\/\/etlawm-cwvy-.*\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-guest-id",
    ],
  }),
);

app.use(express.json());

const PORT = process.env.PORT;


db.connectPG().catch((err) => {
  console.error("❌ [pgdb] Failed to establish initial connection to PostgreSQL:", err.message);
  console.error("Please check your internet connection, database configuration, or credentials.");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/admin", adminRouter);
app.use("/api/cart", cartRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/ingredients", ingredientRouter);
app.use("/api/early-bird-discount", earlyBirdRouter);


app.get("/", (req, res) => { res.send("API working") });

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

app.use((err, req, res, next) => {
  console.error("[unhandled error]", err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error.",
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
