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
  baseUrl: process.env.BASE_URL || "http://localhost:3001",
  outputDir: path.join(process.cwd(), "dist/static"),

  async init() {
    try {
      console.log("Initializing Puppeteer browser...");
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-software-rasterizer",
          "--disable-extensions",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
        ],
        executablePath:
          process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
        protocolTimeout: 180000,
        timeout: 180000,
        defaultViewport: {
          width: 1920,
          height: 1080,
        },
      });
      console.log("Browser initialized successfully");
    } catch (error) {
      console.error("Error initializing browser:", error);
      throw error;
    }
  },

  async generatePage(route) {
    if (!this.browser) throw new Error("Browser not initialized");

    const page = await this.browser.newPage();
    const fullPath = path.join(this.outputDir, route.path);
    const url = `${this.baseUrl}${route.path}`;

    try {
      console.log(`Generating: ${url}`);

      // Ensure directory exists
      await fs.ensureDir(fullPath);

      // Set longer timeout for the page
      page.setDefaultTimeout(120000);
      page.setDefaultNavigationTimeout(120000);

      // Navigate with less strict wait condition
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 120000,
      });

      // Wait a bit for dynamic content
      await page.waitForTimeout(2000);

      // Try to wait for critical elements with timeout
      try {
        await Promise.race([
          page.waitForSelector("title", { timeout: 5000 }),
          page.waitForTimeout(5000),
        ]);
      } catch (e) {
        console.warn(`Warning: Some meta tags not found for ${route.path}`);
      }

      // Capture the HTML
      const html = await page.content();

      // Save the HTML
      const outputPath = path.join(fullPath, "index.html");
      await fs.writeFile(outputPath, html);

      console.log(`✓ Generated: ${route.path}`);
      return true;
    } catch (error) {
      console.error(
        `✗ Error generating page for ${route.path}:`,
        error.message
      );
      return false;
    } finally {
      await page.close();
    }
  },

  async generateBlogPosts() {
    try {
      console.log("Fetching published blog posts...");
      const { data: posts, error } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("status", "published");

      if (error) throw error;

      console.log(`Found ${posts?.length || 0} published posts`);

      if (posts && posts.length > 0) {
        let successCount = 0;
        for (const post of posts) {
          const success = await this.generatePage({
            path: `/blog/${post.slug}`,
          });
          if (success) successCount++;
        }
        console.log(`Generated ${successCount}/${posts.length} blog posts`);
      }
    } catch (error) {
      console.error("Error generating blog posts:", error);
    }
  },

  async generateAll() {
    const startTime = Date.now();
    try {
      console.log("=== Starting static generation ===");
      console.log(`Base URL: ${this.baseUrl}`);
      console.log(`Output directory: ${this.outputDir}`);

      await this.init();

      let successCount = 0;
      let failCount = 0;

      // Generate static routes
      for (const route of routes) {
        const success = await this.generatePage(route);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      }

      // Generate blog posts
      await this.generateBlogPosts();

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log("\n=== Static generation completed ===");
      console.log(`Duration: ${duration}s`);
      console.log(`Success: ${successCount} pages`);
      console.log(`Failed: ${failCount} pages`);
    } catch (error) {
      console.error("Critical error in static generation:", error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
        console.log("Browser closed");
      }
    }
  },
};

export const StaticGenerator = generator;
