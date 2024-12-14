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

// Blog Post Routes
app.get("/api/blog/posts", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        `
        *,
        blog_categories (id, name, slug),
        blog_posts_tags (
          blog_tags (
            id,
            name,
            slug
          )
        ),
        admins (id, username)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    const processedPosts = (data || []).map((post) => ({
      ...post,
      blog_posts_tags: post.blog_posts_tags || [],
    }));

    res.json(processedPosts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({
      error: "Error al obtener los posts",
      details: error.message,
    });
  }
});

// Endpoint público mejorado para el listado del blog
app.get("/api/blog/posts/public", async (req, res) => {
  try {
    const { category, tag, search } = req.query;

    // Primera consulta: Obtenemos los IDs de los posts que cumplen con el filtro de tags
    let postIds;
    if (tag) {
      const { data: taggedPosts, error: tagError } = await supabase
        .from("blog_posts_tags")
        .select("post_id, blog_tags!inner(slug)")
        .eq("blog_tags.slug", tag);

      if (tagError) throw tagError;

      if (!taggedPosts?.length) {
        return res.json({ posts: [] });
      }

      postIds = taggedPosts.map((p) => p.post_id);
    }

    // Segunda consulta: Obtenemos los posts con sus relaciones
    let query = supabase
      .from("blog_posts")
      .select(
        `
        *,
        blog_categories (*),
        blog_posts_tags (
          blog_tags (*)
        )
      `
      )
      .eq("status", "published");

    // Si hay categoría, usamos inner join y filtramos
    if (category) {
      query = supabase
        .from("blog_posts")
        .select(
          `
          *,
          blog_categories!inner (*),
          blog_posts_tags (
            blog_tags (*)
          )
        `
        )
        .eq("status", "published")
        .eq("blog_categories.slug", category);
    }

    // Si hay IDs de posts filtrados por tag, los aplicamos
    if (postIds) {
      query = query.in("id", postIds);
    }

    const { data: posts, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;

    const processedPosts =
      posts?.map((post) => ({
        ...post,
        category: post.blog_categories,
        // Corregimos el procesamiento de tags
        tags:
          post.blog_posts_tags
            ?.map((pt) => ({
              id: pt.blog_tags.id,
              name: pt.blog_tags.name,
              slug: pt.blog_tags.slug,
            }))
            .filter(Boolean) || [],
      })) || [];

    res.json({
      posts: processedPosts,
      activeFilters: { category, tag, search },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Error al obtener los posts" });
  }
});

// Endpoint para obtener un post individual por slug
app.get("/api/blog/posts/public/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: post, error } = await supabase
      .from("blog_posts")
      .select(
        `
        *,
        blog_categories (*),
        blog_posts_tags (
          blog_tags (*)
        )
      `
      )
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Post no encontrado" });
      }
      throw error;
    }

    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    // Procesar el post
    const processedPost = {
      ...post,
      excerpt: post.excerpt || post.content.substring(0, 150) + "...",
      reading_time: Math.ceil(
        (post.content.trim().split(/\s+/).length || 0) / 200
      ),
      tags: post.blog_posts_tags.map((pt) => pt.blog_tags).filter(Boolean),
    };

    // Incrementar contador de vistas
    await supabase
      .from("blog_posts")
      .update({ view_count: (post.view_count || 0) + 1 })
      .eq("id", post.id);

    res.json(processedPost);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    res.status(500).json({
      error: "Error al obtener el post",
      details: error.message,
    });
  }
});

// Incrementar el contador de vistas de un post
app.post("/api/blog/posts/:id/view", async (req, res) => {
  try {
    const { id } = req.params;

    // Incrementar el contador de vistas
    const { data, error } = await supabase.rpc("increment_view_count", {
      post_id: id,
    });

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    res
      .status(500)
      .json({ error: "Error al actualizar el contador de vistas" });
  }
});

// Actualización de Posts
app.put("/api/blog/posts/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      category_id,
      tags,
      featured_image,
      excerpt,
      meta_title,
      meta_description,
      keywords,
      status,
    } = req.body;

    // Verificar propiedad del post y obtener tags actuales
    const { data: existingPost, error: fetchError } = await supabase
      .from("blog_posts")
      .select(
        `
        *,
        blog_posts_tags (
          blog_tags (
            id,
            name,
            slug
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!existingPost) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    // Preparar datos de actualización
    const updateData = {
      title,
      content,
      excerpt,
      featured_image,
      meta_title,
      meta_description,
      keywords,
      category_id,
      updated_at: new Date().toISOString(),
    };

    // Si el estado cambia a publicado, establecer published_at
    if (status === "published" && existingPost.status !== "published") {
      updateData.published_at = new Date().toISOString();
    }
    updateData.status = status;

    // Actualizar el post
    const { data: updatedPost, error: updateError } = await supabase
      .from("blog_posts")
      .update(updateData)
      .eq("id", id)
      .select();

    if (updateError) throw updateError;

    // Manejar actualización de tags solo si se incluyen en la petición
    if ("tags" in req.body) {
      // Obtener los tags actuales
      const currentTags = existingPost.blog_posts_tags.map(
        (pt) => pt.blog_tags.id
      );
      const newTags = Array.isArray(tags) ? tags : [];

      // Verificar si hay cambios reales en los tags
      const tagsHaveChanged =
        currentTags.length !== newTags.length ||
        !currentTags.every((tag) => newTags.includes(tag));

      if (tagsHaveChanged) {
        // Eliminar asociaciones existentes
        const { error: deleteError } = await supabase
          .from("blog_posts_tags")
          .delete()
          .eq("post_id", id);

        if (deleteError) throw deleteError;

        // Crear nuevas asociaciones si hay tags
        if (newTags.length > 0) {
          const tagAssociations = newTags.map((tagId) => ({
            post_id: id,
            tag_id: tagId,
          }));

          const { error: tagError } = await supabase
            .from("blog_posts_tags")
            .insert(tagAssociations);

          if (tagError) throw tagError;
        }
      }
    }

    // Obtener el post actualizado con todas sus relaciones
    const { data: finalPost, error: finalFetchError } = await supabase
      .from("blog_posts")
      .select(
        `
        *,
        blog_categories (*),
        blog_posts_tags (
          blog_tags (
            id,
            name,
            slug
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (finalFetchError) throw finalFetchError;

    // Procesar el post para incluir los tags en un formato más manejable
    const processedPost = {
      ...finalPost,
      tags: finalPost.blog_posts_tags.map((pt) => pt.blog_tags.id),
      blog_posts_tags: finalPost.blog_posts_tags || [],
    };

    res.json(processedPost);
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({
      error: "Error al actualizar el post",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Eliminación de Posts
app.delete("/api/blog/posts/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar existencia y propiedad
    const { data: post, error: fetchError } = await supabase
      .from("blog_posts")
      .select("author_id")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    // Eliminar el post (las asociaciones de tags se eliminarán automáticamente por la restricción ON DELETE CASCADE)
    const { error: deleteError } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    res.json({ message: "Post eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({ error: "Error al eliminar el post" });
  }
});

// Gestión de Categorías
app.get("/api/blog/categories", async (req, res) => {
  try {
    const { data, error } = await supabase.rpc(
      "get_categories_with_post_count"
    );

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Error al obtener las categorías" });
  }
});

app.post("/api/blog/categories", verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const { data: category, error } = await supabase
      .from("blog_categories")
      .insert({ name, description, slug })
      .select()
      .single();

    if (error) throw error;
    res.json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Error al crear la categoría" });
  }
});

// Endpoint para obtener posts por categoría
app.get("/api/blog/category/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Primero verificamos que la categoría existe
    const { data: category, error: categoryError } = await supabase
      .from("blog_categories")
      .select("id")
      .eq("slug", slug)
      .single();

    if (categoryError || !category) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    // Obtenemos los posts de esa categoría
    const {
      data: posts,
      error,
      count,
    } = await supabase
      .from("blog_posts")
      .select(
        `
        *,
        blog_categories!inner (id, name, slug),
        blog_tags (id, name, slug)
      `,
        { count: "exact" }
      )
      .eq("status", "published")
      .eq("blog_categories.slug", slug)
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      posts: Array.isArray(posts) ? posts : [],
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalPosts: count,
      category: category,
    });
  } catch (error) {
    console.error("Error fetching posts by category:", error);
    res.status(500).json({ error: "Error al obtener los posts por categoría" });
  }
});

// Gestión de Tags
// Modificar este endpoint en server/index.js
// Modificar este endpoint
app.get("/api/blog/tags", async (req, res) => {
  try {
    // Obtener todos los tags sin requerir relaciones
    const { data: tags, error } = await supabase
      .from("blog_tags")
      .select(
        `
        id,
        name,
        slug,
        blog_posts_tags (
          post_id
        )
      `
      )
      .order("name");

    if (error) throw error;

    // Procesar los tags para incluir el conteo
    const processedTags = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      post_count: tag.blog_posts_tags ? tag.blog_posts_tags.length : 0,
    }));

    res.json(processedTags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Error al obtener los tags" });
  }
});

// Endpoint para actualizar los tags de un post
app.post("/api/blog/posts/:postId/tags", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { tags } = req.body; // Array de IDs de tags

    // Primero eliminamos las relaciones existentes
    const { error: deleteError } = await supabase
      .from("blog_posts_tags")
      .delete()
      .eq("post_id", postId);

    if (deleteError) throw deleteError;

    // Si hay nuevos tags, los insertamos
    if (tags && tags.length > 0) {
      const tagAssociations = tags.map((tagId) => ({
        post_id: postId,
        tag_id: tagId,
      }));

      const { error: insertError } = await supabase
        .from("blog_posts_tags")
        .insert(tagAssociations);

      if (insertError) throw insertError;
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating post tags:", error);
    res.status(500).json({ error: "Error al actualizar los tags del post" });
  }
});

app.post("/api/blog/tags", verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const { data: tag, error } = await supabase
      .from("blog_tags")
      .insert({ name, slug })
      .select()
      .single();

    if (error) throw error;
    res.json(tag);
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ error: "Error al crear el tag" });
  }
});

// Admin Routes - Protegidas con verifyToken
app.post("/api/blog/posts", verifyToken, async (req, res) => {
  try {
    const { tags, ...postData } = req.body;

    const dataToInsert = {
      ...postData,
      published_at:
        postData.status === "published" ? new Date().toISOString() : null,
    };

    // Crear el post
    const { data: post, error } = await supabase
      .from("blog_posts")
      .insert(dataToInsert)
      .select()
      .single();

    if (error) throw error;

    // Crear las asociaciones de tags
    if (tags && tags.length > 0) {
      const tagAssociations = tags.map((tagId) => ({
        post_id: post.id,
        tag_id: tagId,
      }));

      const { error: tagError } = await supabase
        .from("blog_posts_tags")
        .insert(tagAssociations);

      if (tagError) throw tagError;
    }

    res.json(post);
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ error: "Error al crear el post" });
  }
});

// Actualización de Posts
app.put("/api/blog/posts/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      category_id,
      tags,
      featured_image,
      excerpt,
      meta_title,
      meta_description,
      keywords,
      status,
    } = req.body;

    // Verificar propiedad del post o rol de administrador
    const { data: existingPost, error: fetchError } = await supabase
      .from("blog_posts")
      .select("author_id, status")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!existingPost) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    // Preparar datos de actualización
    const updateData = {
      title,
      content,
      excerpt,
      featured_image,
      meta_title,
      meta_description,
      keywords,
      category_id,
      updated_at: new Date().toISOString(),
    };

    // Si el estado cambia a publicado, establecer published_at
    if (status === "published" && existingPost.status !== "published") {
      updateData.published_at = new Date().toISOString();
    }
    updateData.status = status;

    // Actualizar el post
    const { data: updatedPost, error: updateError } = await supabase
      .from("blog_posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Actualizar tags si se proporcionan
    if (tags) {
      // Eliminar asociaciones existentes
      await supabase.from("blog_posts_tags").delete().eq("post_id", id);

      // Crear nuevas asociaciones
      if (tags.length > 0) {
        const tagAssociations = tags.map((tag_id) => ({
          post_id: id,
          tag_id,
        }));

        const { error: tagError } = await supabase
          .from("blog_posts_tags")
          .insert(tagAssociations);

        if (tagError) throw tagError;
      }
    }

    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({ error: "Error al actualizar el post" });
  }
});

// Eliminación de Posts
app.delete("/api/blog/posts/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar existencia y propiedad
    const { data: post, error: fetchError } = await supabase
      .from("blog_posts")
      .select("author_id")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    // Eliminar el post (las asociaciones de tags se eliminarán automáticamente por la restricción ON DELETE CASCADE)
    const { error: deleteError } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    res.json({ message: "Post eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({ error: "Error al eliminar el post" });
  }
});

// Gestión de Categorías
app.get("/api/blog/categories", async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from("blog_categories")
      .select("*")
      .order("name");

    if (error) throw error;
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Error al obtener las categorías" });
  }
});

app.post("/api/blog/categories", verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const { data: category, error } = await supabase
      .from("blog_categories")
      .insert({ name, description, slug })
      .select()
      .single();

    if (error) throw error;
    res.json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Error al crear la categoría" });
  }
});

// Gestión de Tags
app.get("/api/blog/tags", async (req, res) => {
  try {
    const { data: tags, error: tagsError } = await supabase.from("blog_tags")
      .select(`
        id,
        name,
        slug,
        blog_posts_tags!blog_posts_tags_tag_id_fkey (
          count
        )
      `);

    if (tagsError) throw tagsError;

    // Procesar los tags para obtener el conteo correcto
    const processedTags = tags
      .map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        post_count: tag.blog_posts_tags?.[0]?.count || 0,
      }))
      .sort((a, b) => b.post_count - a.post_count); // Ordenar por cantidad de posts

    res.json(processedTags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Error al obtener los tags" });
  }
});

app.post("/api/blog/tags", verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const { data: tag, error } = await supabase
      .from("blog_tags")
      .insert({ name, slug })
      .select()
      .single();

    if (error) throw error;
    res.json(tag);
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ error: "Error al crear el tag" });
  }
});

// Función helper para generar slugs únicos
async function generateUniqueSlug(title) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  let slug = baseSlug;
  let counter = 1;
  let exists = true;

  while (exists) {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      exists = false;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return slug;
}

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
