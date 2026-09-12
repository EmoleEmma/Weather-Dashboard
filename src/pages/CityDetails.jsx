import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWeather } from "../services/weatherService";
import useOnlineStatus from "../hooks/useOnlineStatus";

export default function CityDetails() {
  const { name } = useParams();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        if (!isOnline) {
          const cached = localStorage.getItem(`weather-${name}`);
          setData(cached ? JSON.parse(cached) : null);
          setLoading(false);
          return;
        }

        const result = await getWeather(name);
        setData(result);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [name, isOnline]);

  useEffect(() => {
    const stored = localStorage.getItem(`note-${name}`);
    if (stored) {
      setNote(stored);
      setSavedNote(stored);
    }
  }, [name]);

  const saveNote = () => {
    localStorage.setItem(`note-${name}`, note);
    setSavedNote(note);
  };

  const deleteNote = () => {
    localStorage.removeItem(`note-${name}`);
    setNote("");
    setSavedNote("");
  };

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data available offline ❌</p>;

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      {!isOnline && (
        <div style={{ color: "red", marginBottom: 10 }}>
          ⚠ Offline Mode — Showing saved data
        </div>
      )}

      <button onClick={() => navigate(-1)}>← Back</button>

      <h1>{data.name}</h1>

      <div style={{ background: "#1e293b", color: "white", padding: 20 }}>
        <p>🌡 Temperature: {data.main.temp}°C</p>
        <p>☁ Condition: {data.weather[0].description}</p>
        <p>💧 Humidity: {data.main.humidity}%</p>
        <p>🌬 Wind Speed: {data.wind.speed} m/s</p>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Notes</h3>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button onClick={saveNote}>Save</button>
        <button onClick={deleteNote}>Delete</button>

        {savedNote && <p>Saved: {savedNote}</p>}
      </div>
    </div>
  );
}