const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const { corsOptions } = require("./config/security");

const authRoutes = require("./modules/auth/auth.routes");
const subjectRoutes = require("./modules/subjects/subject.routes");
const videoRoutes = require("./modules/videos/video.routes");
const progressRoutes = require("./modules/progress/progress.routes");
const healthRoutes = require("./modules/health/health.routes");
const chatRoutes = require("./modules/chat/chat.routes");
const enrollmentRoutes = require("./modules/enrollments/enrollment.routes");
const paymentRoutes = require("./modules/payments/payment.routes");

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.json({ message: "Backend is live", health: "/api/health" });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/payments", paymentRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
