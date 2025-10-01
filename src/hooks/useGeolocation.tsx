import { useState, useEffect } from "react";
import axios from "axios";

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get(
          "https://api.allorigins.win/raw?url=https://ipapi.co/json/"
        );
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
      return "18492705605";
    case "EU":
    default:
      return "18492705605";
  }
};

export default useGeolocation;
export { getWhatsAppNumber };
