"use client";

import { useState } from "react";
import useSWR from "swr";
import { PrioDak } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Heart } from "lucide-react";

interface PrioDakManagerProps {
  currentUser: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function PrioDakManager({ currentUser }: PrioDakManagerProps) {
  const { data: prioDaks, error, mutate } = useSWR<(PrioDak & { user: { name: string } })[]>(
    `/api/priodak`,
    fetcher
  );

  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCardId, setActiveCardId] = useState<number | null>(null);

  const playKissSound = () => {
    try {
      const audio = new Audio("/kiss.ogg");
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Audio playback failed:", e));
    } catch (e) {
      console.error("Audio instantiation failed:", e);
    }
  };

  const handleCardClick = (id: number) => {
    if (activeCardId !== id) {
      playKissSound();
    }
    setActiveCardId(activeCardId === id ? null : id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/priodak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName.trim(),
          userName: currentUser,
        }),
      });

      if (res.ok) {
        setNewName("");
        mutate();
      }
    } catch (error) {
      console.error("Failed to add PrioDak:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/priodak/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mutate();
      }
    } catch (error) {
      console.error("Failed to delete PrioDak:", error);
    }
  };

  const isLoading = !prioDaks && !error;

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-pink-100">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
          <h2 className="text-lg font-medium text-pink-900">প্রিয় ডাক</h2>
        </div>
        <p className="text-sm text-pink-700/80 mb-6">
          যেসব মিষ্টি নামে আপনি তাকে ডাকেন বা সে আপনাকে ডাকে, সেগুলো এখানে জমিয়ে রাখুন!
        </p>

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="নতুন ডাক নাম... (e.g. পাগলী, বাবু)"
            className="w-full bg-white border border-pink-200 rounded-full py-3 px-5 pr-14 text-pink-900 placeholder:text-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-inner"
            maxLength={50}
          />
          <button
            type="submit"
            disabled={!newName.trim() || isSubmitting}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-pink-500 text-white rounded-full flex items-center justify-center hover:bg-pink-600 disabled:opacity-50 disabled:hover:bg-pink-500 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </div>

      <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 min-h-[300px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full text-pink-400">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Heart className="w-8 h-8 fill-current" />
            </motion.div>
          </div>
        ) : error ? (
          <div className="text-center text-pink-600/60 py-10">
            Error loading PrioDaks.
          </div>
        ) : prioDaks?.length === 0 ? (
          <div className="text-center text-pink-500/60 py-10 flex flex-col items-center">
            <Heart className="w-12 h-12 mb-3 opacity-30" />
            <p>এখনো কোনো প্রিয় ডাক যোগ করা হয়নি!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <AnimatePresence>
              {prioDaks?.map((dak) => (
                <motion.div
                  key={dak.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCardClick(dak.id)}
                  className="relative group cursor-pointer"
                >
                  <div
                    className={`h-full aspect-square md:aspect-auto md:h-32 bg-gradient-to-br from-pink-100 to-rose-50 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border border-pink-200 transition-all duration-500 overflow-hidden ${
                      activeCardId === dak.id
                        ? "shadow-pink-300/50 shadow-lg border-pink-400 bg-gradient-to-br from-pink-200 to-rose-100"
                        : "hover:shadow-md hover:border-pink-300"
                    }`}
                  >
                    {/* Floating Hearts Animation Background when Active */}
                    {activeCardId === dak.id && (
                       <motion.div
                         className="absolute inset-0 overflow-hidden pointer-events-none"
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         exit={{ opacity: 0 }}
                       >
                         {[...Array(5)].map((_, i) => (
                           <motion.div
                             key={i}
                             className="absolute text-pink-400/30"
                             initial={{
                               y: 100,
                               x: Math.random() * 100 - 50,
                               scale: 0.5,
                               opacity: 0
                             }}
                             animate={{
                               y: -100,
                               x: Math.random() * 100 - 50,
                               scale: Math.random() * 1.5 + 0.5,
                               opacity: [0, 1, 0]
                             }}
                             transition={{
                               duration: 2 + Math.random() * 2,
                               repeat: Infinity,
                               delay: Math.random() * 2,
                               ease: "easeOut"
                             }}
                           >
                             <Heart className="w-4 h-4 fill-current" />
                           </motion.div>
                         ))}
                       </motion.div>
                    )}

                    <span className="text-xl md:text-2xl font-semibold text-pink-700 text-center break-words w-full z-10 relative px-2">
                      {dak.name}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(dak.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-white/80 rounded-full text-pink-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-white transition-all transform scale-75 md:scale-100 z-20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
