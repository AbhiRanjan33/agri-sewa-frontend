"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { fetchStates, fetchDistricts, type State, type District } from "@/lib/marketApi";
import { getStateName, getDistrictName } from "@/lib/localData";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [username, setUsername] = useState(user?.username || "");
  const [password, setPassword] = useState("");
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedState, setSelectedState] = useState<number | null>(user?.state_id || null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(user?.district_id || null);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  useEffect(() => {
    try {
      const data = fetchStates();
      setStates(data);
    } catch (e) {
      console.error("Failed to load states:", e);
    }
  }, []);

  useEffect(() => {
    if (selectedState) {
      try {
        const data = fetchDistricts(selectedState);
        setDistricts(data);
        if (data.length > 0 && !selectedDistrict) {
          setSelectedDistrict(data[0].district_id);
        }
      } catch (e) {
        console.error("Failed to load districts:", e);
      }
    } else {
      setDistricts([]);
      setSelectedDistrict(null);
    }
  }, [selectedState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingLocation && (!selectedState || !selectedDistrict)) {
      alert(t("selectStateDistrict"));
      return;
    }

    const updateData: any = { username };
    if (password) updateData.password = password;
    if (isEditingLocation && selectedState && selectedDistrict) {
      updateData.state_id = selectedState;
      updateData.district_id = selectedDistrict;
    }

    await updateUser(updateData);
    alert(t("profileUpdated"));
    setIsEditingPassword(false);
    setIsEditingLocation(false);
    setPassword("");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen main-component">
        <div className="text-white text-shadow">{t("loadingProfile")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-lg p-6 md:p-8 space-y-6 main-component fade-in rounded-xl shadow-md"
        >
          <div className="text-center">
            <h1 className="mt-2 text-3xl font-extrabold text-white text-shadow">{t("User Profile")}</h1>
          </div>

          <div className="space-y-6">
            <div className="card p-4">
              <label className="block text-sm font-medium text-gray-700">{t("Username")}</label>
              <p className="mt-1 text-lg text-black">{username}</p>
            </div>

            <div className="card p-4">
              <button
                onClick={() => setIsEditingPassword(!isEditingPassword)}
                className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
              >
                {t("Change Password")}
              </button>
              {isEditingPassword && (
                <div className="mt-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t("Enter New Password")}
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="w-full px-3 py-2 pr-10 mt-1"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-900"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="card p-4">
              <label className="block text-sm font-medium text-gray-700">{t("Current Location")}</label>
              <p className="mt-1 text-lg text-black">
                {getStateName(user.state_id)}, {getDistrictName(user.state_id, user.district_id)}
              </p>
              <button
                onClick={() => setIsEditingLocation(!isEditingLocation)}
                className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
              >
                {t("Change Location")}
              </button>
              {isEditingLocation && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      {t("State")}
                    </label>
                    <select
                      id="state"
                      name="state"
                      required
                      className="w-full px-3 py-2 mt-1"
                      value={selectedState || ""}
                      onChange={(e) => setSelectedState(Number(e.target.value) || null)}
                    >
                      <option value="">{t("selectState")}</option>
                      {states.map((state) => (
                        <option key={state.state_id} value={state.state_id}>
                          {state.state_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                      {t("District")}
                    </label>
                    <select
                      id="district"
                      name="district"
                      required
                      className="w-full px-3 py-2 mt-1"
                      value={selectedDistrict || ""}
                      onChange={(e) => setSelectedDistrict(Number(e.target.value) || null)}
                      disabled={!selectedState}
                    >
                      <option value="">{t("selectDistrict")}</option>
                      {districts.map((district) => (
                        <option key={district.district_id} value={district.district_id}>
                          {district.district_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full btn-primary text-shadow"
              >
                {t("Update Profile")}
              </motion.button>
            </div>
          </form>
          <div className="text-center">
            <Link href="/" className="text-sm text-green-400 hover:text-green-300 hover:underline">
              {t("Back To Home")}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}