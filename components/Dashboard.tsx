"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useLanguage } from '@/lib/LanguageContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard({
  weatherData,
  marketData
}: {
  weatherData: { labels: string[]; values: number[] };
  marketData: { labels: string[]; values: number[] };
}) {
  const { t } = useLanguage();
  const weatherChartData = {
    labels: weatherData.labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: weatherData.values,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)'
      }
    ]
  };

  const marketChartData = {
    labels: marketData.labels,
    datasets: [
      {
        label: 'Price (₹/kg)',
        data: marketData.values,
        backgroundColor: 'rgba(59, 130, 246, 0.5)'
      }
    ]
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 main-component">
      <div className="card p-4 chart-container">
        <h3 className="mb-2 text-sm font-semibold text-black">{t('forecast')}</h3>
        <Line data={weatherChartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
      </div>
      <div className="card p-4 chart-container">
        <h3 className="mb-2 text-sm font-semibold text-black">{t('marketPrices')}</h3>
        <Bar data={marketChartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
      </div>
    </div>
  );
}