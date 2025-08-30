"use client";

import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';

export default function FertilizerTool() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-white">
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="main-component p-6 rounded-xl shadow-md fade-in"
      >
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-white text-shadow">{t('fertilizerTool')}</h3>
        </div>
        <div className="h-[480px] w-full overflow-hidden">
          <iframe
            className="h-full w-full scale-100 transition-transform hover:scale-105"
            src="https://soilhealth.dac.gov.in/fertilizer-dosage"
            title="Fertilizer Dosage Tool"
            loading="lazy"
          />
        </div>
      </motion.div>
    </div>
  );
}