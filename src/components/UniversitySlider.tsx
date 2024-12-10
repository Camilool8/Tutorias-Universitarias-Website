import React, { useEffect, useRef } from "react";
import LazyImage from "./LazyImage";

const UniversitySlider = () => {
  const sliderRef = useRef(null);
  const scrollRef = useRef(0);

  const universities = [
    // República Dominicana
    {
      name: "PUCMM",
      fullName: "Pontificia Universidad Católica Madre y Maestra",
      logo: "https://synergiescorp.com/wp-content/uploads/2019/01/Logo-PUCMM-Color.png",
      country: "República Dominicana",
      url: "https://www.pucmm.edu.do/",
    },
    {
      name: "UASD",
      fullName: "Universidad Autónoma de Santo Domingo",
      logo: "https://www.escueladefilosofia.org/wp-content/uploads/2022/10/uasd_logo-241x300.png",
      country: "República Dominicana",
      url: "https://www.uasd.edu.do/",
    },
    {
      name: "UNPHU",
      fullName: "Universidad Nacional Pedro Henríquez Ureña",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Logo-unphu.jpg/1041px-Logo-unphu.jpg",
      country: "República Dominicana",
      url: "https://www.unphu.edu.do/",
    },
    {
      name: "INTEC",
      fullName: "Instituto Tecnológico de Santo Domingo",
      logo: "https://repositoriobiblioteca.intec.edu.do/assets/intec/images/default-community.png",
      country: "República Dominicana",
      url: "https://www.intec.edu.do/",
    },
    {
      name: "UNIBE",
      fullName: "Universidad Iberoamericana",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Logo_Unibe.svg/1200px-Logo_Unibe.svg.png",
      country: "República Dominicana",
      url: "https://www.unibe.edu.do/",
    },
    {
      name: "UTESA",
      fullName: "Universidad Tecnológica de Santiago",
      logo: "https://seeklogo.com/images/U/utesa-logo-98147DF511-seeklogo.com.png",
      country: "República Dominicana",
      url: "https://www.utesa.edu/home/index.php",
    },
    {
      name: "UFHEC",
      fullName: "Universidad Federico Henríquez y Carvajal",
      logo: "https://ufhec.edu.do/wp-content/uploads/2021/08/Logo-vertical-ic.png",
      country: "República Dominicana",
      url: "https://www.ufhec.edu.do/",
    },
    {
      name: "UAPA",
      fullName: "Universidad Abierta para Adultos",
      logo: "https://www.uapa.edu.do/wp-content/uploads/2022/06/Logo-azul-UAPA.png",
      country: "República Dominicana",
      url: "https://www.uapa.edu.do/",
    },
    {
      name: "UCSD",
      fullName: "Universidad Católica Santo Domingo",
      logo: "https://carrera-universitaria.com/republica-dominicana/logos/ucsd-400.jpg",
      country: "República Dominicana",
      url: "https://www.ucsd.edu.do/",
    },
    {
      name: "UNICARIBE",
      fullName: "Universidad del Caribe",
      logo: "https://www.fundapec.edu.do/wp-content/uploads/2023/06/unicaribe-logo-1024x423.png",
      country: "República Dominicana",
      url: "https://www.unicaribe.edu.do/",
    },
    {
      name: "UNAPEC",
      fullName: "Universidad APEC",
      logo: "https://cdn.unapec.edu.do/portal-dynamic/Documentos/descargas/logo_principal/logo-unapec_color.png",
      country: "República Dominicana",
      url: "https://www.unapec.edu.do/",
    },
    {
      name: "UCE",
      fullName: "Universidad Central del Este",
      logo: "https://w7.pngwing.com/pngs/294/978/png-transparent-universidad-central-del-este-universidad-nacional-pedro-henriquez-urena-central-university-of-ecuador-higher-education-fact-text-logo-university.png",
      country: "República Dominicana",
      url: "https://www.uce.edu.do/",
    },
    {
      name: "ITLA",
      fullName: "Instituto Tecnológico de las Américas",
      logo: "https://educapermanente.itla.edu.do/pluginfile.php/1/core_admin/logo/0x200/1728618874/ITLA-logo-fondo-blanco%20%281%29.png",
      country: "República Dominicana",
      url: "https://www.itla.edu.do/",
    },
    {
      name: "UCATECI",
      fullName: "Universidad Católica del Cibao",
      logo: "https://www.ucateci.edu.do/images/archivos/logo/Logo-UCATECI-2.png",
      country: "República Dominicana",
      url: "https://www.ucateci.edu.do/",
    },
    {
      name: "INFOTEP",
      fullName: "Instituto Nacional de Formación Técnico Profesional",
      logo: "https://tribunadeportiva.com.do/wp-content/uploads/2023/12/logo-infotep.jpg",
      country: "República Dominicana",
      url: "https://www.infotep.gob.do/",
    },
    {
      name: "O&M",
      fullName: "Universidad Dominicana O&M",
      logo: "https://www.udoym.edu.do/wp-content/uploads/2020/10/logo_lema_universidad.png",
      country: "República Dominicana",
      url: "https://www.udoym.edu.do/",
    },
    // Reino Unido
    {
      name: "Oxford",
      fullName: "University of Oxford",
      logo: "https://cdn-icons-png.flaticon.com/512/31/31443.png",
      country: "Reino Unido",
      url: "https://www.ox.ac.uk/",
    },
    {
      name: "Cambridge",
      fullName: "University of Cambridge",
      logo: "https://static.cdnlogo.com/logos/u/49/university-of-cambridge.png",
      country: "Reino Unido",
      url: "https://www.cam.ac.uk/",
    },
    {
      name: "Manchester",
      fullName: "University of Manchester",
      logo: "https://seeklogo.com/images/T/The_University_of_Manchester-logo-FB7EED7C0D-seeklogo.com.png",
      country: "Reino Unido",
      url: "https://www.manchester.ac.uk/",
    },
    // España
    {
      name: "UB",
      fullName: "Universitat de Barcelona",
      logo: "https://seeklogo.com/images/U/universitat-de-barcelona-logo-D23F32C024-seeklogo.com.png",
      country: "España",
      url: "https://www.ub.edu/",
    },
    // Brasil
    {
      name: "USP",
      fullName: "Universidade de São Paulo",
      logo: "https://iconape.com/wp-content/files/yz/190261/svg/190261.svg",
      country: "Brasil",
      url: "https://www.usp.br/",
    },
    {
      name: "UFRJ",
      fullName: "Universidade Federal do Rio de Janeiro",
      logo: "https://ufrj.br/wp-content/uploads/2024/02/cor-vertical.png",
      country: "Brasil",
      url: "https://www.ufrj.br/",
    },
    {
      name: "UNB",
      fullName: "Universidade de Brasília",
      logo: "https://seeklogo.com/images/U/universidade-de-brasila-unb-logo-78C9545107-seeklogo.com.png",
      country: "Brasil",
      url: "https://www.unb.br/",
    },
    {
      name: "UFPR",
      fullName: "Universidade Federal do Paraná",
      logo: "https://seeklogo.com/images/U/Universidade_Federal_do_Parana-logo-39D7ED674B-seeklogo.com.png",
      country: "Brasil",
      url: "https://www.ufpr.br/",
    },
    // México
    {
      name: "UNAM",
      fullName: "Universidad Nacional Autónoma de México",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Escudo-UNAM-escalable.svg",
      country: "México",
      url: "https://www.unam.mx/",
    },
    {
      name: "Tec de Monterrey",
      fullName: "Tecnológico de Monterrey",
      logo: "https://javier.rodriguez.org.mx/itesm/2014/simbolo-tec-blue.png",
      country: "México",
      url: "https://www.tec.mx/",
    },
    // Chile
    {
      name: "UChile",
      fullName: "Universidad de Chile",
      logo: "https://uchile.cl/dam/imagenes/Uchile/imagenes-contenidos-generales/LogoUdeChile/02-escudo-uchile-jpg/escudo-uchile-vertical-azul.jpg",
      country: "Chile",
      url: "https://www.uchile.cl/",
    },
    {
      name: "UC Chile",
      fullName: "Pontificia Universidad Católica de Chile",
      logo: "https://www.pikpng.com/pngl/m/200-2006052_chile-png.png",
      country: "Chile",
      url: "https://www.uc.cl/",
    },
    // Argentina
    {
      name: "UBA",
      fullName: "Universidad de Buenos Aires",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a3/UBA.png",
      country: "Argentina",
      url: "https://www.uba.ar/",
    },
    {
      name: "UNLP",
      fullName: "Universidad Nacional de La Plata",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/74/UNLP_Logo_%28cropped%29.svg",
      country: "Argentina",
      url: "https://www.unlp.edu.ar/",
    },
    // Colombia
    {
      name: "UNAL",
      fullName: "Universidad Nacional de Colombia",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Escudo_unal_2016.png",
      country: "Colombia",
      url: "https://unal.edu.co/",
    },
  ];

  const tripleUniversities = [
    ...universities,
    ...universities,
    ...universities,
  ];

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const scroll = () => {
      if (scrollRef.current >= slider.scrollWidth / 3) {
        scrollRef.current = 0;
        slider.scrollLeft = 0;
      }
      scrollRef.current += 0.5;
      slider.scrollLeft = scrollRef.current;
    };

    const interval = setInterval(scroll, 10);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-white py-16 md:py-28">
      <div className="relative w-full max-w-[1800px] mx-auto">
        <div className="mb-12 md:mb-20 px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Presencia en las siguientes Instituciones Académicas
          </h2>
        </div>

        <div className="relative w-full">
          <div
            ref={sliderRef}
            className="w-full overflow-x-hidden"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
              maskImage:
                "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
            }}
          >
            <div className="flex py-8 md:py-12">
              {tripleUniversities.map((uni, index) => (
                <a
                  key={`${uni.name}-${index}`}
                  href={uni.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex-none mx-2 md:mx-6 transition-transform duration-500 
                           hover:scale-110 w-32 md:w-40"
                >
                  <div
                    className="relative w-full aspect-square flex items-center justify-center
                              bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-xl 
                              transition-all duration-500 overflow-hidden"
                  >
                    {/* Contenedor del contenido centrado */}
                    <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
                      <LazyImage
                        src={uni.logo}
                        alt={uni.fullName}
                        className="object-contain w-full h-full transition-all duration-500
                                 group-hover:brightness-110 group-hover:contrast-110"
                        threshold={0.1}
                        placeholderClassName="rounded-xl md:rounded-2xl"
                        draggable="false"
                      />
                    </div>

                    {/* Overlay de hover */}
                    <div
                      className="absolute inset-0 rounded-xl md:rounded-2xl opacity-0 
                                bg-gradient-to-b from-transparent via-transparent to-black/30
                                group-hover:opacity-100 transition-opacity duration-500"
                    />

                    {/* Tooltip */}
                    <div
                      className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 
                                  transition-opacity duration-300 p-2 text-center transform
                                  translate-y-full group-hover:translate-y-0"
                    >
                      <span
                        className="text-white text-xs md:text-sm font-medium truncate block
                                     text-shadow-sm"
                      >
                        {uni.name}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UniversitySlider;
