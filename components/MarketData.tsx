"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useDataCache } from '@/lib/DataCacheContext';
import { 
  fetchCommodities, 
  fetchStates,
  fetchDistricts,
  fetchPrices, 
  fetchQuantities,
  aggregateDataByDate,
  getLatestDataPoint,
  type Commodity,
  type State,
  type District,
  type PriceData,
  type QuantityData
} from '@/lib/marketApi';
import { 
  getCommodityName, 
  getStateName, 
  getDistrictName 
} from '@/lib/localData';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, subMonths } from 'date-fns';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function MarketData() {
  const { t } = useLanguage();
  const {
    commodities: cachedCommodities,
    states: cachedStates,
    districts: cachedDistricts,
    marketData: cachedMarketData,
    selectedCommodity: cachedSelectedCommodity,
    selectedState: cachedSelectedState,
    selectedDistrict: cachedSelectedDistrict,
    fromDate: cachedFromDate,
    toDate: cachedToDate,
    setCommodities,
    setStates,
    setDistricts,
    setMarketData,
    setSelectedCommodity,
    setSelectedState,
    setSelectedDistrict,
    setDateRange,
    isCommoditiesCached,
    isStatesCached,
    isDistrictsCached,
    isMarketDataCached
  } = useDataCache();

  const [selectedCommodity, setSelectedCommodityLocal] = useState<number | null>(cachedSelectedCommodity || null);
  const [selectedState, setSelectedStateLocal] = useState<number | null>(cachedSelectedState || null);
  const [selectedDistrict, setSelectedDistrictLocal] = useState<number | null>(cachedSelectedDistrict || null);
  const [fromDate, setFromDateLocal] = useState<string>(cachedFromDate || format(subMonths(new Date(), 3), 'yyyy-MM-dd'));
  const [toDate, setToDateLocal] = useState<string>(cachedToDate || format(new Date(), 'yyyy-MM-dd'));
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [quantityData, setQuantityData] = useState<QuantityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (selectedCommodity !== cachedSelectedCommodity) {
      setSelectedCommodity(selectedCommodity);
    }
  }, [selectedCommodity, cachedSelectedCommodity, setSelectedCommodity]);

  useEffect(() => {
    if (selectedState !== cachedSelectedState) {
      setSelectedState(selectedState);
    }
  }, [selectedState, cachedSelectedState, setSelectedState]);

  useEffect(() => {
    if (selectedDistrict !== cachedSelectedDistrict) {
      setSelectedDistrict(selectedDistrict);
    }
  }, [selectedDistrict, cachedSelectedDistrict, setSelectedDistrict]);

  useEffect(() => {
    if (fromDate !== cachedFromDate || toDate !== cachedToDate) {
      setDateRange(fromDate, toDate);
    }
  }, [fromDate, toDate, cachedFromDate, cachedToDate, setDateRange]);

  useEffect(() => {
    if (!isCommoditiesCached() || !isStatesCached()) {
      loadInitialData();
    } else {
      if (!selectedCommodity && cachedCommodities.length > 0) {
        setSelectedCommodityLocal(cachedCommodities[0].commodity_id);
      }
    }
  }, [isCommoditiesCached, isStatesCached, cachedCommodities, selectedCommodity]);

  useEffect(() => {
    if (selectedState) {
      if (!isDistrictsCached(selectedState)) {
        loadDistricts(selectedState);
      } else {
        const districtsForState = cachedDistricts[selectedState];
        if (districtsForState && districtsForState.length > 0 && !selectedDistrict) {
          setSelectedDistrictLocal(districtsForState[0].district_id);
        }
      }
    } else {
      setSelectedDistrictLocal(null);
    }
  }, [selectedState, isDistrictsCached, cachedDistricts, selectedDistrict]);

  const loadInitialData = () => {
    try {
      const commoditiesData = fetchCommodities();
      const statesData = fetchStates();
      setCommodities(commoditiesData);
      setStates(statesData);
      if (commoditiesData.length > 0 && !selectedCommodity) {
        setSelectedCommodityLocal(commoditiesData[0].commodity_id);
      }
    } catch (err) {
      setError('Failed to load initial data');
    }
  };

  const loadDistricts = (stateId: number) => {
    try {
      const districtsData = fetchDistricts(stateId);
      setDistricts(stateId, districtsData);
      if (districtsData.length > 0 && !selectedDistrict) {
        setSelectedDistrictLocal(districtsData[0].district_id);
      }
    } catch (err) {
      setError('Failed to load districts');
    }
  };

  const loadMarketData = async () => {
    if (!selectedCommodity || !selectedState || !selectedDistrict) return;

    const cacheKey = `${selectedCommodity}-${selectedState}-${selectedDistrict}-${fromDate}-${toDate}`;

    if (isMarketDataCached(cacheKey)) {
      const cachedData = cachedMarketData[cacheKey];
      setPriceData(cachedData.prices);
      setQuantityData(cachedData.quantities);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = {
        commodity_id: selectedCommodity,
        state_id: selectedState,
        district_id: [selectedDistrict],
        from_date: fromDate,
        to_date: toDate
      };

      const [priceResponse, quantityResponse] = await Promise.all([
        fetchPrices(params),
        fetchQuantities(params)
      ]);

      setPriceData(priceResponse);
      setQuantityData(quantityResponse);
      
      setMarketData(cacheKey, priceResponse, quantityResponse);
    } catch (err) {
      setError('Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const getCommodityNameLocal = (commodityId: number) => {
    return getCommodityName(commodityId);
  };

  const aggregatedPriceData = priceData.length > 0 ? aggregateDataByDate(priceData, 'modal_price') : [];
  const aggregatedQuantityData = quantityData.length > 0 ? aggregateDataByDate(quantityData, 'quantity') : [];

  const latestPrice = getLatestDataPoint(priceData);
  const latestQuantity = getLatestDataPoint(quantityData);

  const priceChartData = aggregatedPriceData.length > 0 ? {
    labels: aggregatedPriceData.map(d => format(new Date(d.date), 'MMM dd')),
    datasets: [
      {
        label: `${t('modalPrice')} (₹/Quintal)`,
        data: aggregatedPriceData.map(d => d.value),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1
      }
    ]
  } : null;

  const quantityChartData = aggregatedQuantityData.length > 0 ? {
    labels: aggregatedQuantityData.map(d => format(new Date(d.date), 'MMM dd')),
    datasets: [
      {
        label: `${t('arrivalQuantity')} (Tonnes)`,
        data: aggregatedQuantityData.map(d => d.value),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1
      }
    ]
  } : null;

  return (
    <div className="min-h-screen bg-white">
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-6 main-component p-6 rounded-xl shadow-md fade-in"
      >
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4 text-white text-shadow">{t('marketPrices')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">{t('selectCommodity')}</label>
              <select
                value={selectedCommodity || ''}
                onChange={(e) => setSelectedCommodityLocal(Number(e.target.value) || null)}
                className="w-full px-3 py-2"
              >
                <option value="">{t('selectCommodity')}</option>
                {cachedCommodities.map(commodity => (
                  <option key={commodity.commodity_id} value={commodity.commodity_id}>
                    {commodity.commodity_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">{t('selectState')}</label>
              <select
                value={selectedState || ''}
                onChange={(e) => {
                  setSelectedStateLocal(Number(e.target.value) || null);
                  setSelectedDistrictLocal(null);
                }}
                className="w-full px-3 py-2"
              >
                <option value="">{t('selectState')}</option>
                {cachedStates.map(state => (
                  <option key={state.state_id} value={state.state_id}>
                    {state.state_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">{t('selectDistrict')}</label>
              <select
                value={selectedDistrict || ''}
                onChange={(e) => setSelectedDistrictLocal(Number(e.target.value) || null)}
                className="w-full px-3 py-2"
                disabled={!selectedState}
              >
                <option value="">{t('selectDistrict')}</option>
                {selectedState && cachedDistricts[selectedState]?.map((district: District) => (
                  <option key={district.district_id} value={district.district_id}>
                    {district.district_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">{t('dateRange')}</label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDateLocal(e.target.value)}
                  className="w-full px-3 py-2"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDateLocal(e.target.value)}
                  className="w-full px-3 py-2"
                />
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadMarketData}
            disabled={!selectedCommodity || !selectedState || !selectedDistrict || loading}
            className="w-full md:w-auto px-6 py-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-shadow"
          >
            {loading ? t('loading') : t('loadData')}
          </motion.button>

          {error && (
            <div className="card mt-4 p-3">
              <div className="text-red-700">{error}</div>
            </div>
          )}
        </div>

        {(latestPrice || latestQuantity) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestPrice && (
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-2 text-black text-shadow">{t('currentPrices')}</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">{t('minPrice')}:</span>
                    <div className="font-semibold text-black">₹{latestPrice.min_price}/Quintal</div>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('maxPrice')}:</span>
                    <div className="font-semibold text-black">₹{latestPrice.max_price}/Quintal</div>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('modalPrice')}:</span>
                    <div className="font-semibold text-black">₹{latestPrice.modal_price}/Quintal</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {t('asOf')}: {format(new Date(latestPrice.date), 'MMM dd, yyyy')}
                </div>
              </div>
            )}
            
            {latestQuantity && (
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-2 text-black text-shadow">{t('currentArrival')}</h3>
                <div className="text-2xl font-bold text-green-600">
                  {latestQuantity.quantity} Tonnes
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {t('asOf')}: {format(new Date(latestQuantity.date), 'MMM dd, yyyy')}
                </div>
              </div>
            )}
          </div>
        )}

        {priceChartData && quantityChartData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 chart-container">
              <h3 className="text-lg font-semibold mb-4 text-black text-shadow">{t('priceChart')}</h3>
              <Line 
                data={priceChartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true },
                    title: {
                      display: true,
                      text: `${getCommodityNameLocal(selectedCommodity!)} - ${t('modalPrice')}`,
                      color: 'black'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      title: {
                        display: true,
                        text: '₹/Quintal',
                        color: 'black'
                      },
                      ticks: { color: 'gray' }
                    },
                    x: {
                      ticks: { color: 'gray' }
                    }
                  },
                  elements: {
                    line: {
                      tension: 0.1
                    },
                    point: {
                      radius: 4,
                      hoverRadius: 6
                    }
                  }
                }}
              />
            </div>

            <div className="card p-6 chart-container">
              <h3 className="text-lg font-semibold mb-4 text-black text-shadow">{t('quantityChart')}</h3>
              <Line 
                data={quantityChartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true },
                    title: {
                      display: true,
                      text: `${getCommodityNameLocal(selectedCommodity!)} - ${t('arrivalQuantity')}`,
                      color: 'black'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      title: {
                        display: true,
                        text: 'Tonnes',
                        color: 'black'
                      },
                      ticks: { color: 'gray' }
                    },
                    x: {
                      ticks: { color: 'gray' }
                    }
                  },
                  elements: {
                    line: {
                      tension: 0.1
                    },
                    point: {
                      radius: 4,
                      hoverRadius: 6
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {priceData.length === 0 && quantityData.length === 0 && !loading && !error && (
          <div className="card p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  No market data found for the selected crop and location. Please try changing the crop or location.
                </p>
              </div>
            </div>
          </div>
        )}

        {priceData.length > 0 && quantityData.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 text-black text-shadow">{t('dataSummary')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg shadow-inner">
                <div className="text-2xl font-bold text-blue-600">
                  ₹{Math.round(priceData.reduce((sum, d) => sum + d.modal_price, 0) / priceData.length)}
                </div>
                <div className="text-sm text-gray-600">{t('averageModalPrice')}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg shadow-inner">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(quantityData.reduce((sum, d) => sum + d.quantity, 0) / quantityData.length)}
                </div>
                <div className="text-sm text-gray-600">{t('averageQuantity')}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg shadow-inner">
                <div className="text-2xl font-bold text-purple-600">
                  {priceData.length}
                </div>
                <div className="text-sm text-gray-600">{t('dataPoints')}</div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}