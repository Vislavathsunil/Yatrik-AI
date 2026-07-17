import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Compass,
  Plus,
  Search,
  Filter,
  ArrowRightLeft,
  Edit2,
  Check,
  X,
  Download,
  Copy,
  Trash2
} from "lucide-react";
import { SavedTrip, TravelItinerary } from "../types";

interface DashboardProps {
  savedTrips: SavedTrip[];
  setActiveTab: (tab: "planner" | "dashboard") => void;
  scrollToForm: () => void;
  downloadPdf: (itin: TravelItinerary) => void;
  handleDuplicateTrip: (originalTrip: SavedTrip) => void;
  handleEditTripTitle: (tripId: string, newTitle: string) => void;
  deleteSavedTrip: (id: string, e: React.MouseEvent) => void;
  setItinerary: (itin: TravelItinerary | null) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  savedTrips,
  setActiveTab,
  scrollToForm,
  downloadPdf,
  handleDuplicateTrip,
  handleEditTripTitle,
  deleteSavedTrip,
  setItinerary
}) => {
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [dashboardFilterDest, setDashboardFilterDest] = useState("All");
  const [dashboardSort, setDashboardSort] = useState<"latest" | "earliest" | "name">("latest");
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [editingTripTitle, setEditingTripTitle] = useState("");

  const filteredDashboardTrips = () => {
    let result = [...savedTrips];

    // Search
    if (dashboardSearch.trim()) {
      const q = dashboardSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.data.tripTitle.toLowerCase().includes(q) ||
          t.data.destination.toLowerCase().includes(q)
      );
    }

    // Filter destination
    if (dashboardFilterDest !== "All") {
      result = result.filter((t) => t.data.destination === dashboardFilterDest);
    }

    // Sorting
    if (dashboardSort === "latest") {
      result.sort((a, b) => b.timestamp - a.timestamp);
    } else if (dashboardSort === "earliest") {
      result.sort((a, b) => a.timestamp - b.timestamp);
    } else if (dashboardSort === "name") {
      result.sort((a, b) => a.data.tripTitle.localeCompare(b.data.tripTitle));
    }

    return result;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6 animate-fade-in text-left">
      {/* Simple, Elegant Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 font-display flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#0F766E]" />
            <span>My Planned Trips</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-1">
            Access, manage, and download all your saved Indian travel itineraries.
          </p>
        </div>

        <button
          onClick={() => {
            setActiveTab("planner");
            setTimeout(scrollToForm, 100);
          }}
          className="bg-[#FF6B35] text-white px-5 py-2.5 rounded-2xl shadow-sm hover:bg-orange-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none text-xs font-bold"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Escape</span>
        </button>
      </div>

      {/* Search, Filters, and Sorting Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search trips by destination or title..."
            value={dashboardSearch}
            onChange={(e) => setDashboardSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs focus:bg-white focus:border-[#FF6B35] focus:outline-hidden focus:ring-1 focus:ring-[#FF6B35] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Destination */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-2xl">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={dashboardFilterDest}
              onChange={(e) => setDashboardFilterDest(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Destinations</option>
              {Array.from(new Set(savedTrips.map((t) => t.data.destination).filter(Boolean))).map((dest) => (
                <option key={dest} value={dest}>
                  {dest}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-2xl">
            <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500 rotate-90" />
            <select
              value={dashboardSort}
              onChange={(e) => setDashboardSort(e.target.value as any)}
              className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="latest">Sort: Newest</option>
              <option value="earliest">Sort: Oldest</option>
              <option value="name">Sort: Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trip Cards Grid */}
      {filteredDashboardTrips().length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="inline-flex p-4 bg-orange-50 text-[#FF6B35] rounded-3xl">
            <Compass className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No matching itineraries found</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            {dashboardSearch || dashboardFilterDest !== "All"
              ? "Try adjusting your search query or filter values."
              : "You haven't saved any travel plans yet. Create an itinerary using the AI Planner to get started!"}
          </p>
          <button
            onClick={() => {
              setActiveTab("planner");
              setTimeout(scrollToForm, 100);
            }}
            className="px-5 py-2.5 bg-[#0F766E] text-white rounded-xl text-xs font-bold hover:bg-[#0D655E] cursor-pointer"
          >
            Plan An Escape
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDashboardTrips().map((trip) => {
            const isEditing = editingTripId === trip.id;
            const startDateStr = trip.data.startDate;
            const isUpcoming = startDateStr && new Date(startDateStr) > new Date();

            return (
              <motion.div
                key={trip.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-all group"
              >
                {/* Card Header Image Placeholder with gradient overlays */}
                <div className="h-40 bg-slate-900 relative flex items-end p-5 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80"
                    alt={trip.data.destination}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                  {/* Trip Status Badge */}
                  <span
                    className={`absolute top-4 right-4 text-[9px] uppercase tracking-wider font-bold font-mono px-2.5 py-1 rounded-full ${
                      isUpcoming
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-700/50 text-slate-300"
                    }`}
                  >
                    {isUpcoming ? "Upcoming" : "Past"}
                  </span>

                  <div className="relative z-10 text-left space-y-1">
                    <span className="text-[10px] font-bold font-mono uppercase text-[#FF6B35] tracking-widest">
                      {trip.data.budget} • {trip.data.travelStyle}
                    </span>
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="text"
                          value={editingTripTitle}
                          onChange={(e) => setEditingTripTitle(e.target.value)}
                          className="bg-white/95 text-slate-900 text-xs font-bold rounded-lg px-2 py-1 max-w-[180px] focus:outline-hidden"
                        />
                        <button
                          onClick={() => handleEditTripTitle(trip.id, editingTripTitle)}
                          className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingTripId(null)}
                          className="p-1 bg-red-600 hover:bg-red-500 text-white rounded-lg cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-white font-display line-clamp-1">
                          {trip.data.tripTitle}
                        </h4>
                        <button
                          onClick={() => {
                            setEditingTripId(trip.id);
                            setEditingTripTitle(trip.data.tripTitle);
                          }}
                          className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="space-y-0.5">
                      <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">
                        Destination
                      </p>
                      <p className="text-xs font-bold text-slate-700">{trip.data.destination}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">
                        Duration
                      </p>
                      <p className="text-xs font-bold text-slate-700">{trip.data.durationDays} Days</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">
                        Travelers
                      </p>
                      <p className="text-xs font-bold text-slate-700">{trip.data.travelers} Traveler(s)</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">
                        Saved On
                      </p>
                      <p className="text-xs font-bold text-slate-700">
                        {new Date(trip.timestamp).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Card actions */}
                  <div className="flex items-center gap-1.5 pt-3 border-t border-slate-50">
                    {/* Open trip */}
                    <button
                      onClick={() => {
                        setItinerary(trip.data);
                        setActiveTab("planner");
                        setTimeout(() => {
                          document.getElementById("itinerary-results")?.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      }}
                      className="flex-1 py-2 bg-teal-50 hover:bg-teal-100 text-[#0F766E] border-none rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>

                    {/* PDF Download */}
                    <button
                      onClick={() => downloadPdf(trip.data)}
                      title="Download PDF"
                      className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl border border-slate-100 cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => handleDuplicateTrip(trip)}
                      title="Duplicate Trip"
                      className="p-2 hover:bg-purple-50 text-slate-500 hover:text-purple-600 rounded-xl border border-slate-100 cursor-pointer transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => deleteSavedTrip(trip.id, e)}
                      title="Delete Trip"
                      className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl border border-slate-100 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
