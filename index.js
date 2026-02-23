// server/index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");

const connectDB = require("./config/db");

// ✅ DB Model (for socket chat save)
const Message = require("./models/message.model");

// ✅ Chatbot
const chatbotRoutes = require("./routes/chatbot.routes"); // ✅ ADD

// Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const adminRoutes = require("./routes/admin.routes");
const inquiryRoutes = require("./routes/inquiry.routes");
const orderRoutes = require("./routes/order.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();

/**
 * ✅ CORS
 */
const ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ DB connect
connectDB();

// ✅ serve uploads publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("API running ");
});

// ✅ ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/inquiries", inquiryRoutes);

// ✅ socket chat history route
app.use("/api/chat", chatRoutes);

// ✅ chatbot route (FIX 404)
app.use("/api/chatbot", chatbotRoutes); // ✅ ADD

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Socket.IO Setup (your existing)
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
  },
});

/**
 * ✅ Chat logic (your existing)
 */
const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("join", ({ userId, role }) => {
    if (!userId) return;

    socket.data.userId = userId;
    socket.data.role = role;

    onlineUsers.set(userId, socket.id);
    socket.emit("joined", { ok: true, userId, role });
  });

  socket.on("join_chat", ({ chatId }) => {
    if (!chatId) return;

    socket.join(chatId);
    socket.emit("joined_chat", { ok: true, chatId });
  });

  socket.on("send_message", async (payload) => {
    try {
      if (
        !payload?.chatId ||
        !payload?.text ||
        !payload?.senderId ||
        !payload?.senderRole
      ) {
        return;
      }

      const saved = await Message.create({
        chatId: payload.chatId,
        senderId: payload.senderId,
        senderRole: payload.senderRole,
        text: payload.text,
      });

      io.to(saved.chatId).emit("new_message", {
        _id: saved._id,
        chatId: saved.chatId,
        senderId: saved.senderId,
        senderRole: saved.senderRole,
        text: saved.text,
        createdAt: saved.createdAt,
      });
    } catch (err) {
      console.error("❌ send_message error:", err);
    }
  });

  socket.on("disconnect", () => {
    const uid = socket.data?.userId;
    if (uid) onlineUsers.delete(uid);
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// ✅ PORT
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
