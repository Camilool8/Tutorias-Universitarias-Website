import puppeteer from "puppeteer";
import fs from "fs-extra";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const routes = [
  {
    path: "/",
    template: "home",
    metadata: {
      title: "Tutorías Universitarias - Tareas Express en RD",
      description:
        "Realizamos tareas, tutorías y exámenes de Matemáticas, Química, Física, Calculo, Geometría Analítica, Estadística, Ensayos, Tesis, Monográficos, Ensayos, Proyectos finales, entre otras actividades universitarias.",
      type: "website",
    },
  },
  {
    path: "/about",
    template: "about",
    metadata: {
      title: "Sobre Nosotros - Tutorías Universitarias",
      description:
        "Conoce nuestro equipo de tutores expertos y nuestra misión de ayudar a estudiantes a alcanzar la excelencia académica.",
      type: "website",
    },
  },
  {
    path: "/services",
    template: "services",
    metadata: {
      title: "Nuestros Servicios - Tutorías Universitarias",
      description:
        "Descubre nuestra amplia gama de servicios académicos: tutorías personalizadas, resolución de tareas, preparación de exámenes y más.",
      type: "website",
    },
  },
  {
    path: "/turnitin",
    template: "turnitin",
    metadata: {
      title: "Verificación Turnitin - Tutorías Universitarias",
      description:
        "Servicio profesional de verificación de originalidad con Turnitin. Garantizamos la autenticidad de tus trabajos académicos.",
      type: "website",
    },
  },
  {
    path: "/contact",
    template: "contact",
    metadata: {
      title: "Contacto - Tutorías Universitarias",
      description:
        "¿Necesitas ayuda con tus estudios? Contáctanos para recibir asistencia personalizada. Respuesta rápida y atención 24/7.",
      type: "website",
    },
  },
  {
    path: "/blog",
    template: "blog",
    metadata: {
      title: "Blog Universitario - Tutorías Universitarias",
      description:
        "Descubre artículos académicos, consejos de estudio, guías y recursos para mejorar tu rendimiento universitario.",
      type: "website",
    },
  },
  {
    path: "/promo",
    template: "promo",
    metadata: {
      title: "Ofertas Especiales - Tutorías Universitarias",
      description:
        "¿Trabajas y estudias? Aprovecha nuestras ofertas especiales para estudiantes universitarios. Tutores expertos 24/7.",
      type: "website",
    },
  },
  {
    path: "/cotizar",
    template: "cotizar",
    metadata: {
      title: "Cotizar Servicios - Tutorías Universitarias",
      description:
        "Cotiza ahora tu servicio de tutoría personalizada para tus estudiantes universitarios. Proceso rápido, precios competitivos y atención inmediata para todas las materias.",
      type: "website",
    },
  },
];

const generator = {
  browser: null,
  baseUrl: "http://localhost:3001",
  outputDir: path.join(process.cwd(), "dist/static"),

  async init() {
    this.browser = await puppeteer.launch({
      executablePath: "/usr/bin/chromium-browser",
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      protocolTimeout: 30000,
    });
  },

  async generatePage(route) {
    if (!this.browser) throw new Error("Browser not initialized");

    const page = await this.browser.newPage();
    const fullPath = path.join(this.outputDir, route.path);

    try {
      await fs.ensureDir(fullPath);

      await page.goto(`${this.baseUrl}${route.path}`, {
        waitUntil: "networkidle0",
      });

      await page.evaluate(
        (metadata) => {
          const head = document.head;
          const metaTags = [
            `<title>${metadata.title}</title>`,
            `<meta name="description" content="${metadata.description}">`,
            `<meta property="og:title" content="${metadata.title}">`,
            `<meta property="og:description" content="${metadata.description}">`,
            `<meta property="og:image" content="${
              metadata.image || "/default-og-image.jpg"
            }">`,
            `<meta property="og:url" content="${metadata.url}">`,
            `<meta property="og:type" content="${metadata.type}">`,
            metadata.publishedTime
              ? `<meta property="article:published_time" content="${metadata.publishedTime}">`
              : "",
            `<link rel="canonical" href="${metadata.url}">`,
          ].join("");

          head.insertAdjacentHTML("afterbegin", metaTags);
        },
        { ...route.metadata, url: `${this.baseUrl}${route.path}` }
      );

      const html = await page.content();
      await fs.writeFile(path.join(fullPath, "index.html"), html);
    } catch (error) {
      console.error(`Error generating page for ${route.path}:`, error);
      throw error;
    } finally {
      await page.close();
    }
  },

  async generateBlogPosts() {
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published");

    if (error) throw error;

    for (const post of posts) {
      await this.generatePage({
        path: `/blog/${post.slug}`,
        metadata: {
          title: post.meta_title || post.title,
          description: post.meta_description || post.excerpt,
          image: post.featured_image,
          type: "article",
          publishedTime: post.published_at,
        },
      });
    }
  },

  async generateAll() {
    try {
      await this.init();

      for (const route of routes) {
        await this.generatePage(route);
      }

      await this.generateBlogPosts();
    } catch (error) {
      console.error("Error in static generation:", error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  },
};

export const StaticGenerator = generator;
