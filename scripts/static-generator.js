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
  },
  {
    path: "/about",
    template: "about",
  },
  {
    path: "/services",
    template: "services",
  },
  {
    path: "/turnitin",
    template: "turnitin",
  },
  {
    path: "/contact",
    template: "contact",
  },
  {
    path: "/blog",
    template: "blog",
  },
  {
    path: "/promo",
    template: "promo",
  },
  {
    path: "/cotizar",
    template: "cotizar",
  },
];

const generator = {
  browser: null,
  baseUrl: "http://localhost:3001",
  outputDir: path.join(process.cwd(), "dist/static"),

  async init() {
    try {
      this.browser = await puppeteer.launch({
        headless: "true",
        args: ["--no-sandbox", "--disable-gpu"],
        protocolTimeout: 180000,
        timeout: 180000,
        defaultViewport: {
          width: 1920,
          height: 1080,
        },
      });
    } catch (error) {
      console.error("Error initializing browser:", error);
      throw error;
    }
  },

  async generatePage(route) {
    if (!this.browser) throw new Error("Browser not initialized");
    const page = await this.browser.newPage();
    const fullPath = path.join(this.outputDir, route.path);

    try {
      // Asegurar que el directorio existe
      await fs.ensureDir(fullPath);

      // Navegar a la página y esperar a que todo esté cargado
      await page.goto(`${this.baseUrl}${route.path}`, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });

      // Esperar a que Helmet haya insertado los meta tags
      await Promise.all([
        page.waitForSelector("title"),
        page.waitForSelector('meta[property="og:title"]'),
        page.waitForSelector('link[rel="canonical"]'),
      ]);

      // Capturar el HTML ya hidratado
      const html = await page.content();

      // Guardar el HTML
      await fs.writeFile(path.join(fullPath, "index.html"), html);
    } catch (error) {
      console.error(`Error generating page for ${route.path}:`, error);
      throw error;
    } finally {
      await page.close();
    }
  },

  async generateBlogPosts() {
    try {
      const { data: posts, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published");

      if (error) throw error;

      for (const post of posts) {
        await this.generatePage({
          path: `/blog/${post.slug}`,
        });
      }
    } catch (error) {
      console.error("Error generating blog posts:", error);
      throw error;
    }
  },

  async generateAll() {
    try {
      console.log("Starting static generation...");
      await this.init();

      for (const route of routes) {
        console.log(`Generating ${route.path}...`);
        await this.generatePage(route);
      }

      console.log("Generating blog posts...");
      await this.generateBlogPosts();

      console.log("Static generation completed successfully!");
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
