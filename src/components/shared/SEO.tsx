import { Helmet } from "react-helmet";
interface SEOProps {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType?: string;
  keywords?: string;
  image?: string;
  children?: React.ReactNode;
  structuredData?: object;
  alternateUrls?: { lang: string; url: string }[];
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalUrl,
  ogType = "website",
  keywords,
  image = "https://www.tutoriasuniversitarias.com/images/og-tutorias-universitarias.webp",
  children,
  structuredData,
  alternateUrls,
}) => {
  const siteName = "Tutorías Universitarias";
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Tutorías Universitarias",
    description:
      "Servicios de tutoría experta para estudiantes universitarios en todas las materias.",
    url: "https://www.tutoriasuniversitarias.com",
    logo: "https://www.tutoriasuniversitarias.com/images/logo-dark.svg",
    sameAs: [
      "https://www.facebook.com/profile.php?id=100088640089400&mibextid=LQQJ4d",
      "https://www.instagram.com/tutorias_universitarias/",
    ],
  };

  return (
    <Helmet>
      {/* Configuración básica */}
      <html lang="es" />
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{`${title} | ${siteName}`}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta
        name="author"
        content="Tutorías Universitarias - Tareas y Exámenes Express en RD"
      />
      <link rel="canonical" href={canonicalUrl} />

      {/* Favicons */}
      <link
        rel="icon"
        type="image/svg+xml"
        href="/images/logo-dark.svg"
        media="(prefers-color-scheme: light)"
      />
      <link
        rel="icon"
        type="image/svg+xml"
        href="/images/logo.svg"
        media="(prefers-color-scheme: dark)"
      />

      {/* PNG favicons - Light Mode */}
      {[16, 32, 48, 96, 144].map((size) => (
        <link
          key={`light-${size}`}
          rel="icon"
          type="image/png"
          sizes={`${size}x${size}`}
          href={`/images/favicon-light-${size}x${size}.png`}
          media="(prefers-color-scheme: light)"
        />
      ))}

      {/* PNG favicons - Dark Mode */}
      {[16, 32, 48, 96, 144].map((size) => (
        <link
          key={`dark-${size}`}
          rel="icon"
          type="image/png"
          sizes={`${size}x${size}`}
          href={`/images/favicon-dark-${size}x${size}.png`}
          media="(prefers-color-scheme: dark)"
        />
      ))}

      {/* Apple Touch Icons */}
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/images/apple-touch-icon-light.png"
        media="(prefers-color-scheme: light)"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/images/apple-touch-icon-dark.png"
        media="(prefers-color-scheme: dark)"
      />

      {/* Theme Colors */}
      <meta
        name="theme-color"
        content="#ffffff"
        media="(prefers-color-scheme: light)"
      />
      <meta
        name="theme-color"
        content="#2b5797"
        media="(prefers-color-scheme: dark)"
      />
      <meta
        name="msapplication-TileColor"
        content="#ffffff"
        media="(prefers-color-scheme: light)"
      />
      <meta
        name="msapplication-TileColor"
        content="#2b5797"
        media="(prefers-color-scheme: dark)"
      />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={`${title} | ${siteName}`} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta
        property="og:image:alt"
        content={`${siteName} - ${title} - Imagen representativa`}
      />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={`${title} | ${siteName}`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta
        name="twitter:image:alt"
        content={`${siteName} - ${title} - Imagen representativa`}
      />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>

      {/* Preconnect */}
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />

      {/* Alternate URLs */}
      {alternateUrls?.map(({ lang, url }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}

      {children}
    </Helmet>
  );
};

export default SEO;
