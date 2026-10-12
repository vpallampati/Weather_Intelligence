import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Shirt,
  Activity,
  Navigation,
  ShieldAlert,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { PlanningRecommendations, RecommendationItem } from '../types';

interface PlanningRecommendationsProps {
  recommendations: PlanningRecommendations | null;
  isLoadingAi: boolean;
  onRefreshAi: () => void;
  isDark?: boolean;
}

export const PlanningRecommendationsCard: React.FC<PlanningRecommendationsProps> = ({
  recommendations,
  isLoadingAi,
  onRefreshAi,
  isDark = false,
}) => {
  if (!recommendations) {
    return null;
  }

  const getLevelBadge = (level: RecommendationItem['level']) => {
    switch (level) {
      case 'optimal':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Optimal
          </span>
        );
      case 'moderate':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-stone-100 text-stone-700 border-stone-300'}`}>
            Moderate
          </span>
        );
      case 'caution':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            Caution
          </span>
        );
      case 'alert':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200">
            <AlertTriangle className="w-3 h-3" />
            Notice
          </span>
        );
      default:
        return null;
    }
  };

  const categories = [
    {
      key: 'attire',
      data: recommendations.attire,
      icon: <Shirt className={`w-4 h-4 ${isDark ? 'text-slate-300' : 'text-stone-700'}`} />,
      label: 'Attire & Wardrobe',
    },
    {
      key: 'outdoor',
      data: recommendations.outdoorActivities,
      icon: <Activity className={`w-4 h-4 ${isDark ? 'text-slate-300' : 'text-stone-700'}`} />,
      label: 'Outdoor & Sports',
    },
    {
      key: 'commute',
      data: recommendations.commuteAndTravel,
      icon: <Navigation className={`w-4 h-4 ${isDark ? 'text-slate-300' : 'text-stone-700'}`} />,
      label: 'Commute & Travel',
    },
    {
      key: 'health',
      data: recommendations.healthAndComfort,
      icon: <ShieldAlert className={`w-4 h-4 ${isDark ? 'text-slate-300' : 'text-stone-700'}`} />,
      label: 'Health & Sun Safety',
    },
  ];

  const containerClass = isDark
    ? 'bg-slate-900/80 backdrop-blur-md border-slate-700/80 text-white shadow-lg'
    : 'bg-white/85 backdrop-blur-md border-white/70 text-stone-900 shadow-sm';
  const textTitle = isDark ? 'text-white' : 'text-stone-900';
  const textSubtle = isDark ? 'text-slate-400' : 'text-stone-500';
  const borderDivider = isDark ? 'border-slate-800' : 'border-stone-100';
  const briefingBox = isDark
    ? 'bg-slate-800/70 border-slate-700/80 text-slate-200'
    : 'bg-white/70 border-stone-200/80 text-stone-800';
  const recCard = isDark
    ? 'bg-slate-800/60 border-slate-700/80'
    : 'bg-white/70 border-stone-200/80';

  return (
    <div
      id="planning-recommendations-section"
      className={`${containerClass} border rounded-2xl p-5 sm:p-7 space-y-5 transition-colors duration-500`}
    >
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${borderDivider}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-base font-bold ${textTitle}`}>Planning Recommendations</h3>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                  recommendations.source === 'gemini'
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {recommendations.source === 'gemini' ? 'Gemini AI Intelligence' : 'Meteorological Engine'}
              </span>
            </div>
            <p className={`text-xs ${textSubtle}`}>Actionable guidance derived from forecast telemetry</p>
          </div>
        </div>

        <button
          id="refresh-ai-recommendations-btn"
          type="button"
          onClick={onRefreshAi}
          disabled={isLoadingAi}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold ${isDark ? 'text-slate-200 bg-slate-800 hover:bg-slate-700 border-slate-700' : 'text-stone-700 bg-stone-50 hover:bg-stone-100 border-stone-200'} border rounded-lg transition-colors self-start sm:self-auto disabled:opacity-50`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
          <span>{isLoadingAi ? 'Synthesizing...' : 'Update Recommendations'}</span>
        </button>
      </div>

      {/* Executive Intelligence Briefing */}
      <AnimatePresence mode="wait">
        {recommendations.summary && (
          <motion.div
            key={recommendations.summary}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            id="executive-summary-box"
            className={`p-4 ${briefingBox} border rounded-xl space-y-1.5`}
          >
            <span className={`text-[11px] font-bold uppercase tracking-wider ${textSubtle} block`}>
              Executive Meteorological Briefing
            </span>
            <p className="text-sm leading-relaxed">{recommendations.summary}</p>
            {recommendations.bestOutdoorHours && (
              <div className={`pt-2 flex items-center gap-2 text-xs font-medium ${isDark ? 'text-amber-300' : 'text-stone-700'}`}>
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Optimal outdoor window: <strong>{recommendations.bestOutdoorHours}</strong></span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4 Categorized Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(({ key, data, icon, label }, idx) => {
          if (!data) return null;
          return (
            <motion.div
              key={`${key}-${data.title}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: idx * 0.05 }}
              id={`recommendation-card-${key}`}
              className={`${recCard} border rounded-xl p-4 flex flex-col justify-between space-y-3`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? 'text-slate-200' : 'text-stone-700'} uppercase tracking-wide`}>
                    {icon}
                    <span>{label}</span>
                  </div>
                  {getLevelBadge(data.level)}
                </div>

                <h4 className={`text-sm font-bold ${textTitle}`}>{data.title}</h4>
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-stone-600'} leading-relaxed`}>{data.advice}</p>
              </div>

              {data.actionItem && (
                <div className={`pt-2 border-t ${borderDivider} flex items-center justify-between text-[11px]`}>
                  <span className={textSubtle}>Key Takeaway:</span>
                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-stone-800'} text-right truncate pl-2`}>
                    {data.actionItem}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
