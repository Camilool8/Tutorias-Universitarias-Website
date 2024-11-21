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
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";

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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:
    "Demasiadas solicitudes de envío de correo, por favor intente más tarde",
});

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

// Email routes

// Endpoint para enviar correos
app.post("/api/send-email", verifyToken, emailLimiter, async (req, res) => {
  const { to, subject, content, isHtml } = req.body;

  try {
    // Configuración del correo
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      [isHtml ? "html" : "text"]: content,
      headers: {
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
        Precedence: "Bulk",
        "List-Unsubscribe": `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`,
      },
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);

    // Registrar el envío exitoso
    const { error: logError } = await supabase.from("email_logs").insert([
      {
        recipient: to,
        subject,
        sent_at: new Date().toISOString(),
        status: "sent",
      },
    ]);

    if (logError) {
      console.error("Error al registrar el envío:", logError);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error al enviar el correo:", error);

    // Registrar el error
    await supabase.from("email_logs").insert([
      {
        recipient: to,
        subject,
        sent_at: new Date().toISOString(),
        status: "error",
        error_message: error.message,
      },
    ]);

    res.status(500).json({
      error: "Error al enviar el correo",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Endpoint para actualizar el estado de un lead
app.patch("/api/leads/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status, last_contacted } = req.body;

  try {
    const { data, error } = await supabase
      .from("leads")
      .update({
        status,
        last_contacted,
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error al actualizar el lead:", error);
    res.status(500).json({
      error: "Error al actualizar el estado del lead",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Endpoint para obtener estadísticas con datos por hora
app.get("/api/email-stats", verifyToken, async (req, res) => {
  try {
    // Obtener las últimas 24 horas de logs
    const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("email_logs")
      .select("*")
      .gte("sent_at", startTime.toISOString())
      .order("sent_at", { ascending: true });

    if (error) throw error;

    // Procesar datos por hora
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(startTime);
      hour.setHours(hour.getHours() + i);

      const hourLogs = data.filter((log) => {
        const logDate = new Date(log.sent_at);
        return logDate.getHours() === hour.getHours();
      });

      return {
        hour: hour.getHours().toString().padStart(2, "0") + ":00",
        sent: hourLogs.filter((log) => log.status === "sent").length,
        failed: hourLogs.filter((log) => log.status === "error").length,
        successRate:
          hourLogs.length > 0
            ? (
                (hourLogs.filter((log) => log.status === "sent").length /
                  hourLogs.length) *
                100
              ).toFixed(1)
            : 0,
      };
    });

    const stats = {
      total: data.length,
      sent: data.filter((log) => log.status === "sent").length,
      failed: data.filter((log) => log.status === "error").length,
      successRate: data.length
        ? (
            (data.filter((log) => log.status === "sent").length / data.length) *
            100
          ).toFixed(1)
        : 0,
      hourlyData,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      error: "Error al obtener estadísticas",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

app.get("/api/email-service/status", verifyToken, async (req, res) => {
  try {
    await transporter.verify();

    const { data: recentLogs, error } = await supabase
      .from("email_logs")
      .select("status")
      .gte("sent_at", new Date(Date.now() - 60000).toISOString());

    if (error) throw error;

    const recentErrors =
      recentLogs?.filter((log) => log.status === "error").length || 0;
    const serviceStatus = recentErrors > 5 ? "degraded" : "operational";

    res.json({
      status: serviceStatus,
      lastMinute: {
        total: recentLogs?.length || 0,
        errors: recentErrors,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Servicio no disponible",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Email Templates Routes
app.get("/api/email-templates", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error fetching email templates:", error);
    res.status(500).json({ error: "Error al obtener las plantillas" });
  }
});

app.post("/api/email-templates", verifyToken, async (req, res) => {
  try {
    const { name, description, subject, html_content } = req.body;

    const { data, error } = await supabase
      .from("email_templates")
      .insert([
        {
          name,
          description,
          subject,
          html_content,
        },
      ])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error("Error creating email template:", error);
    res.status(500).json({ error: "Error al crear la plantilla" });
  }
});

app.put("/api/email-templates/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, subject, html_content } = req.body;

    const { data, error } = await supabase
      .from("email_templates")
      .update({
        name,
        description,
        subject,
        html_content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error("Error updating email template:", error);
    res.status(500).json({ error: "Error al actualizar la plantilla" });
  }
});

app.delete("/api/email-templates/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("email_templates")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ message: "Plantilla eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting email template:", error);
    res.status(500).json({ error: "Error al eliminar la plantilla" });
  }
});

// Route para obtener una plantilla específica
app.get("/api/email-templates/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Plantilla no encontrada" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching email template:", error);
    res.status(500).json({ error: "Error al obtener la plantilla" });
  }
});

// Lead routes

app.post("/api/capture-lead", async (req, res) => {
  try {
    const { email } = req.body;

    const { data, error } = await supabase
      .from("leads")
      .insert([{ email }])
      .select();

    if (error) {
      if (error.code === "23505") {
        // Unique violation
        return res.status(409).json({
          message: "Este correo ya está registrado en nuestra base de datos",
        });
      }
      throw error;
    }

    res.json({
      message: "Lead capturado exitosamente",
      data: data[0],
    });
  } catch (error) {
    console.error("Error capturing lead:", error);
    res.status(500).json({
      message: "Error al procesar la solicitud",
    });
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

app.get("/api/leads", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Error fetching leads" });
  }
});

app.patch("/api/leads/:id", verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from("leads")
      .update(req.body)
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ message: "Lead updated successfully" });
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ error: "Error updating lead" });
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
