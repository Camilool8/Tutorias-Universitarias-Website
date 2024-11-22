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

app.post("/api/submit-form", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

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

// Backend: Modificación del endpoint check-email
app.post("/api/check-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "El email es requerido" });
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .select("id, status")
      .eq("email", email.toLowerCase().trim());

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      const lead = data[0];
      if (lead.status !== "not_interested") {
        return res.json({
          exists: true,
          status: lead.status,
        });
      }
      return res.json({
        exists: false,
        message: "Este email ya está desuscrito",
      });
    }

    return res.json({
      exists: false,
      message: "Email no encontrado",
    });
  } catch (error) {
    console.error("Error al verificar email:", error);
    return res.status(500).json({
      error: "Error al verificar el email",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

app.post("/api/send-email", verifyToken, emailLimiter, async (req, res) => {
  const { to, subject, content, isHtml } = req.body;

  try {
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

    await transporter.sendMail(mailOptions);

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

app.get("/api/email-stats", verifyToken, async (req, res) => {
  try {
    const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("email_logs")
      .select("*")
      .gte("sent_at", startTime.toISOString())
      .order("sent_at", { ascending: true });

    if (error) throw error;

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

app.post("/api/check-lead-status", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: "El correo electrónico es requerido",
    });
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .select("status, unsubscribed_at")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.json({ status: "new" });
    }

    if (data.status === "not_interested" && data.unsubscribed_at) {
      const daysSinceLastContact = Math.floor(
        (new Date() - new Date(data.unsubscribed_at)) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastContact > 30) {
        return res.json({ status: "reengagement_opportunity" });
      }
    }

    res.json({ status: data.status });
  } catch (error) {
    console.error("Error checking lead status:", error);
    res.status(500).json({
      error: "Error al verificar el estado del lead",
    });
  }
});

app.post("/api/unsubscribe", async (req, res) => {
  const { email, reason, feedback } = req.body;

  if (!email) {
    return res.status(400).json({ error: "El email es requerido" });
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .update({
        status: "not_interested",
        unsubscribed_at: new Date().toISOString(),
        unsubscribe_reason: reason || null,
        unsubscribe_feedback: feedback || null,
      })
      .eq("email", email.toLowerCase().trim())
      .select();

    if (error) throw error;

    res.json({
      success: true,
      message: "Te has desuscrito exitosamente",
    });
  } catch (error) {
    console.error("Error en la desuscripción:", error);
    res.status(500).json({
      error: "Error al procesar la desuscripción",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

app.post("/api/stay-subscribed", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "El email es requerido" });
  }

  try {
    const { data: currentData, error: fetchError } = await supabase
      .from("leads")
      .select("stay_count")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (fetchError) throw fetchError;

    const newStayCount = (currentData?.stay_count || 0) + 1;

    const { data, error } = await supabase
      .from("leads")
      .update({
        stay_count: newStayCount,
        last_stay_at: new Date().toISOString(),
        last_contacted_at: new Date().toISOString(),
      })
      .eq("email", email.toLowerCase().trim())
      .select();

    if (error) throw error;

    return res.json({
      success: true,
      message: "¡Gracias por quedarte con nosotros!",
      data,
    });
  } catch (error) {
    console.error("Error al registrar retención:", error);
    return res.status(500).json({
      error: "Error al procesar la solicitud",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Analytics routes

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

// app.patch("/api/leads/:id", verifyToken, async (req, res) => {
//   try {
//     const { error } = await supabase
//       .from("leads")
//       .update(req.body)
//       .eq("id", req.params.id);

//     if (error) throw error;
//     res.json({ message: "Lead updated successfully" });
//   } catch (error) {
//     console.error("Error updating lead:", error);
//     res.status(500).json({ error: "Error updating lead" });
//   }
// });

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "../dist/index.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
