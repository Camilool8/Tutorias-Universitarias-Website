import { useState, useEffect } from "react";
import axios from "axios";

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get("https://ipapi.co/json/");
        setLocation(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return { location, loading, error };
};

const getWhatsAppNumber = (continentCode: string) => {
  switch (continentCode) {
    case "NA":
    case "SA":
      return "18492701295"; // Number for Americas
    case "EU":
    default:
      return "34608837272"; // Number for Europe and default for all other locations
  }
};

export default useGeolocation;
export { getWhatsAppNumber };
