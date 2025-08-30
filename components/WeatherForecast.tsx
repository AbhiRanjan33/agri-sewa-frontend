"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useDataCache } from "@/lib/DataCacheContext";
import {
  fetchWeatherData,
  getCurrentLocation,
  getWeatherDescription,
  getAgricultureInsights,
  type WeatherData,
  type LocationData,
} from "@/lib/weatherApi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { format, type Locale } from "date-fns";
import { enUS, hi, te, ta } from "date-fns/locale";
import pa from "@/lib/locales/pa";
import mr from "@/lib/locales/mr";
import { motion } from "framer-motion";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const dateLocales: { [key: string]: Locale } = {
  en: enUS,
  hi: hi,
  pa: pa,
  mr: mr,
  te: te,
  ta: ta,
};

export default function WeatherForecast() {
  const { t, language } = useLanguage();
  const {
    weatherData: cachedWeatherData,
    locationData: cachedLocationData,
    setWeatherData,
    setLocationData,
    isWeatherDataCached,
  } = useDataCache();

  const [weatherData, setWeatherDataLocal] = useState<WeatherData | null>(null);
  const [location, setLocationLocal] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    setLoading(true);
    setError("");

    try {
      let userLocation: LocationData;
      if (cachedLocationData) {
        userLocation = cachedLocationData;
        setLocationLocal(userLocation);
      } else {
        userLocation = await getCurrentLocation();
        setLocationData(userLocation);
        setLocationLocal(userLocation);
      }

      setLocationPermission(true);

      const cacheKey = `${userLocation.latitude.toFixed(4)}-${userLocation.longitude.toFixed(4)}`;

      if (isWeatherDataCached(cacheKey)) {
        const cachedData = cachedWeatherData[cacheKey];
        setWeatherDataLocal(cachedData);
        setLoading(false);
        return;
      }

      const data = await fetchWeatherData(userLocation.latitude, userLocation.longitude);
      setWeatherDataLocal(data);
      setWeatherData(cacheKey, data);
    } catch (err) {
      console.error("Weather data error:", err);
      setError(err instanceof Error ? err.message : "Failed to load weather data");
      setLocationPermission(false);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code: number, isDay = true) => {
    if (code >= 0 && code <= 3) return isDay ? "☀️" : "🌙";
    if (code >= 45 && code <= 48) return "🌫️";
    if (code >= 51 && code <= 67) return "🌧️";
    if (code >= 71 && code <= 77) return "❄️";
    if (code >= 80 && code <= 99) return "⛈️";
    return "🌤️";
  };

  const currentLocale = dateLocales[language] || enUS;

  const temperatureChartData = weatherData
    ? {
        labels: weatherData.hourly.time.slice(0, 24).map((time) => format(new Date(time), "HH:mm")),
        datasets: [
          {
            label: `${t("temperature")} (${t("temperatureUnit")})`,
            data: weatherData.hourly.temperature_2m.slice(0, 24),
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.1)",
            tension: 0.1,
          },
          {
            label: `${t("feelsLike")} (${t("temperatureUnit")})`,
            data: weatherData.hourly.apparent_temperature.slice(0, 24),
            borderColor: "rgb(54, 162, 235)",
            backgroundColor: "rgba(54, 162, 235, 0.1)",
            tension: 0.1,
          },
        ],
      }
    : null;

  const precipitationChartData = weatherData
    ? {
        labels: weatherData.daily.time.map((time) => format(new Date(time), "MMM dd", { locale: currentLocale })),
        datasets: [
          {
            label: `${t("precipitation")} (${t("precipitationUnit")})`,
            data: weatherData.daily.precipitation_sum,
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            borderColor: "rgb(75, 192, 192)",
            borderWidth: 1,
          },
        ],
      }
    : null;

  const agricultureInsights = weatherData ? getAgricultureInsights(weatherData, t) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="main-component p-6 rounded-xl shadow-md">
          <div className="card h-32 flex items-center justify-center">
            <div className="text-lg text-black">{t("loading")}</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="main-component p-6 rounded-xl shadow-md">
          <div className="card text-center p-6">
            <div className="text-red-600 mb-4">{error}</div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadWeatherData}
              className="btn-primary text-shadow"
            >
              {t("retry")}
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="main-component p-6 rounded-xl shadow-md">
          <div className="card text-center p-6">
            <div className="text-gray-600 mb-4">{t("noDataAvailable")}</div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadWeatherData}
              className="btn-primary text-shadow"
            >
              {t("getLocation")}
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-6 main-component p-6 rounded-xl shadow-md fade-in"
      >
        {/* Current Weather */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4 text-white text-shadow">{t("currentWeather")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg shadow-inner">
              <div className="text-4xl mb-2">
                {getWeatherIcon(weatherData.current.weather_code, weatherData.current.is_day === 1)}
              </div>
              <div className="text-2xl font-bold text-blue-600">{Math.round(weatherData.current.temperature_2m)}°C</div>
              <div className="text-sm text-gray-600">{getWeatherDescription(weatherData.current.weather_code, t)}</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg shadow-inner">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(weatherData.current.relative_humidity_2m)}%
              </div>
              <div className="text-sm text-gray-600">{t("humidity")}</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg shadow-inner">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round(weatherData.current.wind_speed_10m)} km/h
              </div>
              <div className="text-sm text-gray-600">{t("windSpeed")}</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg shadow-inner">
              <div className="text-2xl font-bold text-purple-600">{Math.round(weatherData.current.precipitation)} mm</div>
              <div className="text-sm text-gray-600">{t("precipitation")}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-3 bg-gray-50 rounded shadow-inner">
              <div className="text-sm text-gray-600">{t("feelsLike")}</div>
              <div className="font-semibold text-black">{Math.round(weatherData.current.apparent_temperature)}°C</div>
            </div>
            <div className="p-3 bg-gray-50 rounded shadow-inner">
              <div className="text-sm text-gray-600">{t("pressure")}</div>
              <div className="font-semibold text-black">{Math.round(weatherData.current.pressure_msl)} hPa</div>
            </div>
            <div className="p-3 bg-gray-50 rounded shadow-inner">
              <div className="text-sm text-gray-600">{t("uvIndex")}</div>
              <div className="font-semibold text-black">{Math.round(weatherData.current.uv_index)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-3 bg-orange-50 rounded shadow-inner">
              <div className="text-sm text-gray-600">{t("soilTemperature")}</div>
              <div className="font-semibold text-orange-600">
                {Math.round(weatherData.current.soil_temperature_0cm)}°C
              </div>
            </div>
            <div className="p-3 bg-brown-50 rounded shadow-inner">
              <div className="text-sm text-gray-600">{t("soilMoisture")}</div>
              <div className="font-semibold text-brown-600">
                {Math.round(weatherData.current.soil_moisture_0_1cm * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Agriculture Insights */}
        {agricultureInsights && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 text-black text-shadow">{t("agricultureInsights")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg shadow-inner">
                <div className="font-semibold text-blue-600 mb-2">{t("irrigation")}</div>
                <div className="text-sm text-gray-600">{agricultureInsights.irrigation}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg shadow-inner">
                <div className="font-semibold text-green-600 mb-2">{t("cropHealth")}</div>
                <div className="text-sm text-gray-600">{agricultureInsights.cropHealth}</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg shadow-inner">
                <div className="font-semibold text-yellow-600 mb-2">{t("pestRisk")}</div>
                <div className="text-sm text-gray-600">{agricultureInsights.pestRisk}</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg shadow-inner">
                <div className="font-semibold text-purple-600 mb-2">{t("harvestTiming")}</div>
                <div className="text-sm text-gray-600">{agricultureInsights.harvestTiming}</div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 chart-container">
            <h3 className="text-lg font-semibold mb-4 text-black text-shadow">{t("temperatureForecast")}</h3>
            {temperatureChartData && (
              <Line
                data={temperatureChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true, labels: { color: 'black' } },
                    title: {
                      display: true,
                      text: t("temperatureForecast"),
                      color: 'black'
                    }
                  },
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: t("temperatureUnit"),
                        color: 'black'
                      },
                      ticks: { color: 'gray' },
                      grid: { color: 'rgba(0,0,0,0.1)' }
                    },
                    x: {
                      ticks: { color: 'gray' },
                      grid: { color: 'rgba(0,0,0,0.1)' }
                    }
                  },
                }}
              />
            )}
          </div>

          <div className="card p-6 chart-container">
            <h3 className="text-lg font-semibold mb-4 text-black text-shadow">{t("precipitationForecast")}</h3>
            {precipitationChartData && (
              <Bar
                data={precipitationChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true, labels: { color: 'black' } },
                    title: {
                      display: true,
                      text: t("precipitationForecast"),
                      color: 'black'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: t("precipitationUnit"),
                        color: 'black'
                      },
                      ticks: { color: 'gray' },
                      grid: { color: 'rgba(0,0,0,0.1)' }
                    },
                    x: {
                      ticks: { color: 'gray' },
                      grid: { color: 'rgba(0,0,0,0.1)' }
                    }
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Daily Forecast */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 text-black text-shadow">{t("sevenDayForecast")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weatherData.daily.time.map((date, index) => (
              <div key={date} className="text-center p-3 bg-green-50 rounded shadow-inner">
                <div className="text-sm font-medium text-gray-600">
                  {format(new Date(date), "EEE", { locale: currentLocale })}
                </div>
                <div className="text-2xl my-2">{getWeatherIcon(weatherData.daily.weather_code[index])}</div>
                <div className="text-sm font-semibold text-black">{Math.round(weatherData.daily.temperature_2m_max[index])}°</div>
                <div className="text-xs text-gray-600">{Math.round(weatherData.daily.temperature_2m_min[index])}°</div>
                <div className="text-xs text-blue-600 mt-1">
                  {Math.round(weatherData.daily.precipitation_sum[index])}mm
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}