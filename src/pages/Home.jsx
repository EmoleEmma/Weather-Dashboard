import { useEffect, useState } from "react";
import { getWeather } from "../services/weatherService";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const cities = [
    "London","New York","Tokyo","Paris","Berlin",
    "Moscow","Beijing","Delhi","Lagos","Cairo",
    "Dubai","Madrid","Rome","Sydney","Toronto"
  ];

  const [weatherData, setWeatherData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Load favorites
  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // Fetch default cities
  useEffect(() => {
    const fetchAllWeather = async () => {
      setLoading(true);

      try {
        const results = [];

        for (let city of cities) {
          const data = await getWeather(city);
          results.push(data);
        }

        setWeatherData(results);
      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    };

    fetchAllWeather();
  }, []);

  // 🔍 SEARCH FUNCTION
  const handleSearch = async () => {
    if (!search) return;

    try {
      const data = await getWeather(search);

      if (!weatherData.find(c => c.name === data.name)) {
        setWeatherData([data, ...weatherData]);
      }

      setSearch("");
    } catch (err) {
      alert("City not found");
    }
  };

  // 📍 GEOLOCATION
  const getCurrentLocationWeather = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const data = await getWeather(`${latitude},${longitude}`);
        setWeatherData([data, ...weatherData]);
      } catch (err) {
        console.log(err);
      }
    });
  };

  // ⭐ Toggle favorite
  const toggleFavorite = (name) => {
    let updated = favorites.includes(name)
      ? favorites.filter((c) => c !== name)
      : [...favorites, name];

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  // ❌ Remove city
  const removeCity = (name) => {
    const updated = weatherData.filter((c) => c.name !== name);
    setWeatherData(updated);

    const favUpdated = favorites.filter((f) => f !== name);
    setFavorites(favUpdated);
    localStorage.setItem("favorites", JSON.stringify(favUpdated));
  };

  // Sort (favorites first)
  const sorted = [...weatherData].sort((a, b) => {
    const aFav = favorites.includes(a.name);
    const bFav = favorites.includes(b.name);

    if (aFav === bFav) return a.name.localeCompare(b.name);
    return bFav - aFav;
  });

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        🌍 Weather Dashboard
      </h1>

      {/* 🔍 SEARCH + 📍 GEO */}
      <div className="mb-6 flex gap-2 justify-center flex-wrap">
        <input
          type="text"
          placeholder="Search city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-60"
        />

        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 rounded"
        >
          Search
        </button>

        <button
          onClick={getCurrentLocationWeather}
          className="bg-green-500 text-white px-4 rounded"
        >
          📍 My Location
        </button>
      </div>

      {/* GRID */}
      <div className="grid gap-4 md:grid-cols-3">
        {sorted.map((city) => (
          <div
            key={city.name}
            className="bg-white shadow-lg rounded-2xl p-4 hover:scale-105 transition"
          >
            <h2
              onClick={() => navigate(`/city/${city.name}`)}
              className="text-xl font-bold cursor-pointer"
            >
              {city.name}
            </h2>

            <p className="mt-2">🌡️ Temperature: {city.main.temp}°C</p>
            <p>🌥️ Condition: {city.weather[0].description}</p>

            <button
              onClick={() => toggleFavorite(city.name)}
              className="mt-3 px-3 py-1 bg-yellow-400 rounded mr-2"
            >
              ⭐ Favorite
            </button>

            <button
              onClick={() => removeCity(city.name)}
              className="mt-3 px-3 py-1 bg-red-500 text-white rounded"
            >
              ❌ Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}