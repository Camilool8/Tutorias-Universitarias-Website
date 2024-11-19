import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(compression());
app.use(bodyParser.json());
app.use(cors());

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(403).json({ error: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Unauthorized" });
    req.userId = decoded.id;
    next();
  });
};

const setCustomCacheControl = (res, path) => {
  const hashRegex = /\.[0-9a-f]{8}\./;

  if (
    path.endsWith(".webp") ||
    path.endsWith(".png") ||
    path.endsWith(".jpg")
  ) {
    res.setHeader("Cache-Control", "public, max-age=604800");
  } else if (hashRegex.test(path)) {
    res.setHeader("Cache-Control", "public, max-age=31536000");
  } else {
    res.setHeader("Cache-Control", "public, max-age=86400");
  }
};
app.use(compression());
app.use(
  express.static(path.join(__dirname, "../dist"), {
    setHeaders: setCustomCacheControl,
  })
);

// Admin routes
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const { data: users, error } = await supabase
      .from("admins")
      .select("*")
      .eq("username", username)
      .single();

    if (error) throw error;

    if (users && (await bcrypt.compare(password, users.password))) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
      res.json({ token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/create-admin", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("admins")
      .insert({ username, password: hashedPassword });

    if (error) throw error;

    res.json({ message: "Admin user created successfully" });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/check-admin", async (req, res) => {
  try {
    const { data, error, count } = await supabase
      .from("admins")
      .select("*", { count: "exact" });

    if (error) throw error;

    res.json({ exists: count > 0 });
  } catch (error) {
    console.error("Check admin error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Submission routes

app.post("/api/submit-form", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Generate task ID
    const { data: countData, error: countError } = await supabase
      .from("task_counter")
      .select("count")
      .eq("date", today)
      .single();

    if (countError && countError.code !== "PGRST116") {
      throw countError;
    }

    let count = countData ? countData.count + 1 : 1;

    const { error: upsertError } = await supabase
      .from("task_counter")
      .upsert({ date: today, count: count }, { onConflict: "date" });

    if (upsertError) throw upsertError;

    const taskId = `#T${count.toString().padStart(3, "0")}${today.replace(
      /-/g,
      ""
    )}`;

    // Insert submission with generated ID
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        ...req.body,
        id: taskId,
        submittedAt: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({ error: "Error submitting form" });
  }
});

app.get("/api/submissions", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("submittedAt", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Error fetching submissions" });
  }
});

app.get("/api/analytics", verifyToken, async (req, res) => {
  try {
    const { data: submissions, error } = await supabase
      .from("submissions")
      .select("*")
      .order("submittedAt", { ascending: false });

    if (error) throw error;

    const totalOrders = submissions.length;
    const completedOrders = submissions.filter(
      (s) => s.status === "Completada"
    ).length;
    const inProgressOrders = submissions.filter(
      (s) => s.status === "En progreso"
    ).length;
    const cancelledOrders = submissions.filter(
      (s) => s.status === "Cancelada"
    ).length;
    const totalProfit = submissions.reduce(
      (sum, s) => sum + parseFloat(s.profit),
      0
    );
    const lostProfit = submissions
      .filter((s) => s.status === "Cancelada")
      .reduce((sum, s) => sum + parseFloat(s.profit), 0);

    const last7Days = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split("T")[0];
      })
      .reverse();

    const dailyOrderCounts = last7Days.map((date) => {
      const daySubmissions = submissions.filter((s) =>
        s.submittedAt.startsWith(date)
      );
      return {
        date,
        count: daySubmissions.length,
        profit: daySubmissions.reduce(
          (sum, s) => sum + parseFloat(s.profit),
          0
        ),
      };
    });

    const profitBySubject = Object.entries(
      submissions.reduce((acc, s) => {
        acc[s.subject] = (acc[s.subject] || 0) + parseFloat(s.profit);
        return acc;
      }, {})
    ).map(([subject, profit]) => ({ subject, profit }));

    const profitTrend = Object.entries(
      submissions.reduce((acc, s) => {
        const month = s.submittedAt.slice(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + parseFloat(s.profit);
        return acc;
      }, {})
    ).map(([month, profit]) => ({ month, profit }));

    const monthlyData = submissions.reduce((acc, s) => {
      const month = s.submittedAt.slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { total: 0, completed: 0 };
      }
      acc[month].total++;
      if (s.status === "Completada") {
        acc[month].completed++;
      }
      return acc;
    }, {});

    const conversionRate = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      rate: (data.completed / data.total) * 100,
    }));

    const orderStatusDistribution = [
      { status: "Completada", count: completedOrders },
      { status: "En progreso", count: inProgressOrders },
      { status: "Cancelada", count: cancelledOrders },
    ];

    res.json({
      totalOrders,
      completedOrders,
      inProgressOrders,
      cancelledOrders,
      totalProfit,
      lostProfit,
      dailyOrderCounts,
      profitBySubject,
      profitTrend,
      orderStatusDistribution,
      conversionRate,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Error fetching analytics" });
  }
});

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "../dist/index.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
