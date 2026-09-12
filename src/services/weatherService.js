export const getWeather = async (city) => {
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
  );

  const data = await res.json();

  // cache for offline use
  localStorage.setItem(`weather-${city}`, JSON.stringify(data));

  return data;
};