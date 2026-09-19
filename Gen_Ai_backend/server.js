const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// ======================================================
// CONFIG
// ======================================================

const PRO_DURATION_DAYS = 30;
const PRO_DURATION_MS =
  PRO_DURATION_DAYS * 24 * 60 * 60 * 1000;

const PAYMENTS_FILE = path.join(__dirname, "payments.json");

// ======================================================
// API KEY STATUS
// ======================================================

console.log(
  "OPENAI API KEY LOADED:",
  Boolean(process.env.OPENAI_API_KEY)
);

console.log(
  "POLLINATIONS KEY LOADED:",
  Boolean(process.env.POLLINATIONS_API_KEY)
);

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());
app.use(express.json());

// ======================================================
// PAYMENT FILE
// ======================================================

function loadPayments() {
  try {
    if (!fs.existsSync(PAYMENTS_FILE)) {
      fs.writeFileSync(PAYMENTS_FILE, "[]");
      return [];
    }

    const data = fs.readFileSync(PAYMENTS_FILE, "utf8");

    if (!data.trim()) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading payments:", error);
    return [];
  }
}

function savePayments(payments) {
  fs.writeFileSync(
    PAYMENTS_FILE,
    JSON.stringify(payments, null, 2)
  );
}

// ======================================================
// HELPER - CHECK PRO EXPIRY
// ======================================================

function isProActive(payment) {
  if (!payment) {
    return false;
  }

  if (payment.status !== "verified") {
    return false;
  }

  if (payment.pro !== true) {
    return false;
  }

  if (!payment.expiresAt) {
    return false;
  }

  const expiryTime = new Date(payment.expiresAt).getTime();

  if (Number.isNaN(expiryTime)) {
    return false;
  }

  return expiryTime > Date.now();
}

// ======================================================
// OPENAI CHAT
// ======================================================

function buildSystemPrompt(settings = {}) {
  const personality =
    settings.personality || "Friendly, helpful and clear";

  const language =
    settings.language || "English";

  return `
You are Shree AI.

Personality:
${personality}

Preferred language:
${language}

Be helpful, clear and beginner-friendly.

If the user asks programming questions,
explain things simply and provide working examples.
`;
}

// ======================================================
// HOME
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Shree AI Backend is running 🤖",
    status: "online"
  });
});

// ======================================================
// CHAT
// ======================================================

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], settings = {} } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message is required"
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "OpenAI API key is missing"
      });
    }

    const messages = [
      {
        role: "system",
        content: buildSystemPrompt(settings)
      }
    ];

    if (Array.isArray(history)) {
      history
        .slice(-10)
        .forEach((item) => {
          if (
            item &&
            (item.role === "user" ||
              item.role === "assistant") &&
            typeof item.content === "string"
          ) {
            messages.push({
              role: item.role,
              content: item.content
            });
          }
        });
    }

    messages.push({
      role: "user",
      content: message.trim()
    });

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);

      return res.status(response.status).json({
        success: false,
        error:
          data?.error?.message ||
          "OpenAI request failed"
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    res.json({
      success: true,
      reply
    });

  } catch (error) {
    console.error("Chat error:", error);

    res.status(500).json({
      success: false,
      error: "Chat request failed"
    });
  }
});

// ======================================================
// IMAGE GENERATION
// ======================================================

app.post("/api/image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Image prompt is required"
      });
    }

    const encodedPrompt =
      encodeURIComponent(prompt.trim());

    const imageURL =
      `https://gen.pollinations.ai/image/${encodedPrompt}` +
      `?model=flux&width=768&height=768&nologo=true`;

    const response = await fetch(imageURL, {
      headers: {
        Authorization:
          `Bearer ${process.env.POLLINATIONS_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Pollinations error:",
        errorText
      );

      return res.status(response.status).json({
        success: false,
        error: "Image generation failed"
      });
    }

    const buffer =
      Buffer.from(
        await response.arrayBuffer()
      );

    const base64 =
      buffer.toString("base64");

    res.json({
      success: true,
      image:
        `data:image/png;base64,${base64}`
    });

  } catch (error) {
    console.error(
      "Image generation error:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Image generation failed"
    });
  }
});

// ======================================================
// UPI PAYMENT INFORMATION
// ======================================================

app.get(
  "/api/payment/upi-info",
  async (req, res) => {
    try {
      const amount = 199;

      const upiId =
        process.env.UPI_ID || "yourupi@upi";

      const upiName =
        process.env.UPI_NAME || "Shree AI";

      const upiLink =
        `upi://pay?pa=${encodeURIComponent(upiId)}` +
        `&pn=${encodeURIComponent(upiName)}` +
        `&am=${amount}` +
        `&cu=INR`;

      res.json({
        success: true,
        amount,
        upiId,
        upiName,
        upiLink
      });

    } catch (error) {
      console.error(
        "UPI info error:",
        error
      );

      res.status(500).json({
        success: false,
        error: "Could not generate UPI information"
      });
    }
  }
);

// ======================================================
// SUBMIT UPI PAYMENT
// ======================================================

app.post(
  "/api/payment/upi",
  async (req, res) => {
    try {
      const {
        name,
        email,
        transactionId
      } = req.body;

      if (
        !name ||
        !email ||
        !transactionId
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Name, email and transaction ID are required"
        });
      }

      const payments = loadPayments();

      // ----------------------------------------------
      // CHECK DUPLICATE TRANSACTION
      // ----------------------------------------------

      const duplicate =
        payments.find(
          (payment) =>
            payment.transactionId
              .toLowerCase() ===
            transactionId
              .trim()
              .toLowerCase()
        );

      if (duplicate) {
        return res.status(400).json({
          success: false,
          error:
            "This transaction ID has already been submitted"
        });
      }

      // ----------------------------------------------
      // CREATE PAYMENT
      // ----------------------------------------------

      const payment = {
        id:
          Date.now().toString(),

        name:
          name.trim(),

        email:
          email.trim().toLowerCase(),

        transactionId:
          transactionId.trim(),

        plan:
          "Pro",

        amount:
          199,

        status:
          "pending",

        pro:
          false,

        submittedAt:
          new Date().toISOString(),

        verifiedAt:
          null,

        startedAt:
          null,

        expiresAt:
          null
      };

      payments.push(payment);

      savePayments(payments);

      res.json({
        success: true,
        message:
          "Payment submitted successfully. Waiting for verification.",
        payment
      });

    } catch (error) {
      console.error(
        "UPI payment error:",
        error
      );

      res.status(500).json({
        success: false,
        error: "Could not save payment"
      });
    }
  }
);

// ======================================================
// PAYMENT STATUS
// ======================================================

app.get(
  "/api/payment/status",
  (req, res) => {
    try {
      const email =
        req.query.email;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Email is required"
        });
      }

      const payments =
        loadPayments();

      // Find most recent payment for this email
      const userPayments =
        payments
          .filter(
            (payment) =>
              payment.email ===
              email.trim().toLowerCase()
          )
          .sort(
            (a, b) =>
              new Date(b.submittedAt) -
              new Date(a.submittedAt)
          );

      if (userPayments.length === 0) {
        return res.json({
          success: true,
          pro: false,
          status: "none",
          expiresAt: null
        });
      }

      const payment =
        userPayments[0];

      // ----------------------------------------------
      // CHECK IF VERIFIED PRO IS STILL ACTIVE
      // ----------------------------------------------

      if (isProActive(payment)) {
        return res.json({
          success: true,

          pro: true,

          status:
            "verified",

          plan:
            "Pro",

          amount:
            payment.amount,

          startedAt:
            payment.startedAt,

          expiresAt:
            payment.expiresAt
        });
      }

      // ----------------------------------------------
      // EXPIRED
      // ----------------------------------------------

      if (
        payment.status === "verified" &&
        payment.expiresAt &&
        new Date(payment.expiresAt).getTime() <=
          Date.now()
      ) {
        return res.json({
          success: true,

          pro: false,

          status:
            "expired",

          plan:
            "Free",

          startedAt:
            payment.startedAt,

          expiresAt:
            payment.expiresAt
        });
      }

      // ----------------------------------------------
      // PENDING / REJECTED / OTHER
      // ----------------------------------------------

      return res.json({
        success: true,

        pro: false,

        status:
          payment.status,

        plan:
          "Free",

        expiresAt:
          payment.expiresAt || null
      });

    } catch (error) {
      console.error(
        "Payment status error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "Could not check payment status"
      });
    }
  }
);

// ======================================================
// ADMIN AUTH
// ======================================================

function checkAdmin(req, res, next) {
  const password =
    req.headers["x-admin-password"];

  if (
    !password ||
    password !==
      process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized"
    });
  }

  next();
}

// ======================================================
// ADMIN - GET PAYMENTS
// ======================================================

app.get(
  "/api/admin/payments",
  checkAdmin,
  (req, res) => {
    try {
      const payments =
        loadPayments();

      res.json({
        success: true,
        payments
      });

    } catch (error) {
      console.error(
        "Admin payments error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "Could not load payments"
      });
    }
  }
);

// ======================================================
// ADMIN - VERIFY PAYMENT
// ======================================================

app.post(
  "/api/admin/verify",
  checkAdmin,
  (req, res) => {
    try {
      const { id } =
        req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error:
            "Payment ID is required"
        });
      }

      const payments =
        loadPayments();

      const paymentIndex =
        payments.findIndex(
          (payment) =>
            payment.id === id
        );

      if (paymentIndex === -1) {
        return res.status(404).json({
          success: false,
          error:
            "Payment not found"
        });
      }

      const payment =
        payments[paymentIndex];

      const now =
        new Date();

      // ----------------------------------------------
      // PRO START DATE
      // ----------------------------------------------

      const startedAt =
        now.toISOString();

      // ----------------------------------------------
      // PRO EXPIRY = 30 DAYS
      // ----------------------------------------------

      const expiresAt =
        new Date(
          now.getTime() +
          PRO_DURATION_MS
        ).toISOString();

      // ----------------------------------------------
      // UPDATE PAYMENT
      // ----------------------------------------------

      payment.status =
        "verified";

      payment.pro =
        true;

      payment.verifiedAt =
        startedAt;

      payment.startedAt =
        startedAt;

      payment.expiresAt =
        expiresAt;

      payments[paymentIndex] =
        payment;

      savePayments(payments);

      console.log(
        `PRO ACTIVATED: ${payment.email}`
      );

      console.log(
        `Expires: ${expiresAt}`
      );

      res.json({
        success: true,

        message:
          "Payment verified and Pro activated for 30 days.",

        payment
      });

    } catch (error) {
      console.error(
        "Admin verify error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "Could not verify payment"
      });
    }
  }
);

// ======================================================
// ADMIN - REJECT PAYMENT
// ======================================================

app.post(
  "/api/admin/reject",
  checkAdmin,
  (req, res) => {
    try {
      const { id } =
        req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error:
            "Payment ID is required"
        });
      }

      const payments =
        loadPayments();

      const paymentIndex =
        payments.findIndex(
          (payment) =>
            payment.id === id
        );

      if (paymentIndex === -1) {
        return res.status(404).json({
          success: false,
          error:
            "Payment not found"
        });
      }

      payments[paymentIndex].status =
        "rejected";

      payments[paymentIndex].pro =
        false;

      payments[paymentIndex].verifiedAt =
        null;

      payments[paymentIndex].startedAt =
        null;

      payments[paymentIndex].expiresAt =
        null;

      savePayments(payments);

      res.json({
        success: true,
        message:
          "Payment rejected."
      });

    } catch (error) {
      console.error(
        "Admin reject error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "Could not reject payment"
      });
    }
  }
);

// ======================================================
// 404
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// ======================================================
// SERVER
// ======================================================

const server =
  app.listen(
    PORT,
    () => {
      console.log("");
      console.log(
        "======================================"
      );
      console.log(
        "🚀 Shree AI Backend Started"
      );
      console.log(
        `🌐 http://localhost:${PORT}`
      );
      console.log(
        "💎 Pro duration: 30 days"
      );
      console.log(
        "======================================"
      );
      console.log("");
    }
  );

// ======================================================
// SHUTDOWN
// ======================================================

process.on(
  "SIGINT",
  () => {
    console.log(
      "\nShutting down server..."
    );

    server.close(() => {
      process.exit(0);
    });
  }
);