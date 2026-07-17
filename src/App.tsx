import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  Utensils,
  Heart,
  Footprints,
  MapPin,
  Calendar,
  IndianRupee,
  Users,
  Printer,
  Trash2,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Info,
  Lightbulb,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  History,
  Clock,
  Check,
  Plus,
  Minus,
  LogIn,
  LogOut,
  UserPlus,
  X,
  Menu,
  Key,
  Camera,
  Flame,
  Download,
  Play,
  Star,
  HelpCircle,
  Send,
  LayoutDashboard,
  Instagram,
  Facebook,
  Twitter,
  Linkedin
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import { TravelItinerary, FormInputs, SavedTrip } from "./types";
import { auth } from "./firebase/config";
import {
  signUpWithEmail,
  loginWithEmail,
  loginWithGoogle,
  triggerPasswordReset,
  logoutUser
} from "./firebase/auth";
import {
  createUserProfile,
  getUserProfile,
  saveTrip,
  getUserTrips,
  updateTrip,
  deleteTrip,
  duplicateTrip,
  UserProfile,
  TripPlan
} from "./firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { Dashboard } from "./components/Dashboard";


// @ts-ignore
import yatrikHero from "./assets/images/yatrik_hero_1784116172222.jpg";
// @ts-ignore
import routeHighlights from "./assets/images/route_highlights_1784187971284.jpg";
// @ts-ignore
import heroIndianDestinations from "./assets/images/hero_indian_destinations_1784188239444.jpg";




const POPULAR_DESTINATIONS = [
  {
    name: "Manali",
    style: "Adventure",
    img: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&auto=format&fit=crop&q=80",
    season: "Oct - Jun",
    duration: "4 Days",
    budget: "Mid-range",
    rating: "4.8",
    description: "Snowy peaks, wooden cottages, and Solang Valley thrills."
  },
  {
    name: "Jaisalmer",
    style: "Cultural",
    img: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=600&auto=format&fit=crop&q=80",
    season: "Nov - Mar",
    duration: "3 Days",
    budget: "Budget",
    rating: "4.7",
    description: "Golden sand dunes, magnificent forts, and desert safaris."
  },
  {
    name: "Goa",
    style: "Relaxation",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
    season: "Nov - Feb",
    duration: "5 Days",
    budget: "Mid-range",
    rating: "4.9",
    description: "Pristine beaches, beautiful churches, and dynamic nightlife."
  },
  {
    name: "Munnar",
    style: "Relaxation",
    img: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=600&auto=format&fit=crop&q=80",
    season: "Sep - May",
    duration: "4 Days",
    budget: "Mid-range",
    rating: "4.8",
    description: "Lush tea gardens, mist-capped hills, and serene lakes."
  },
  {
    name: "Jaipur",
    style: "Cultural",
    img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop&q=80",
    season: "Oct - Mar",
    duration: "3 Days",
    budget: "Budget",
    rating: "4.8",
    description: "Historic palaces, vibrant bazaars, and delicious Rajasthani food."
  },
  {
    name: "Leh-Ladakh",
    style: "Adventure",
    img: "https://6a5a6257116fd9eb075abfd5.imgix.net/sandbox/ladak.jpeg",
    season: "May - Sep",
    duration: "7 Days",
    budget: "Luxury",
    rating: "4.9",
    description: "High-altitude blue lakes, monasteries, and motorable passes."
  },
  {
    name: "Ranthambore",
    style: "Wildlife",
    img: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600&auto=format&fit=crop&q=80",
    season: "Oct - Jun",
    duration: "3 Days",
    budget: "Mid-range",
    rating: "4.6",
    description: "Exciting tiger safaris, heritage forts, and rich biodiversity."
  },
  {
    name: "Andaman",
    style: "Relaxation",
    img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600&auto=format&fit=crop&q=80",
    season: "Oct - May",
    duration: "6 Days",
    budget: "Luxury",
    rating: "4.9",
    description: "Turquoise coral waters, scuba diving, and private islands."
  },
  {
    name: "Kashmir",
    style: "Honeymoon",
    img: "https://images.unsplash.com/photo-1595878715977-2e8f8df18ea8?w=600&auto=format&fit=crop&q=80",
    season: "Mar - Oct",
    duration: "6 Days",
    budget: "Luxury",
    rating: "4.9",
    description: "Dal Lake houseboat Shikara rides, tulip gardens, and Gulmarg snow."
  },
  {
    name: "Coorg",
    style: "Relaxation",
    img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop&q=80",
    season: "Oct - Mar",
    duration: "3 Days",
    budget: "Budget",
    rating: "4.7",
    description: "Scented coffee plantations, misty valleys, and quiet waterfalls."
  },
  {
    name: "Pondicherry",
    style: "Cultural",
    img: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=600&auto=format&fit=crop&q=80",
    season: "Oct - Mar",
    duration: "3 Days",
    budget: "Budget",
    rating: "4.7",
    description: "French colonial quarters, golden beaches, and Auroville ashram."
  },
  {
    name: "Rishikesh",
    style: "Spiritual",
    img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80",
    season: "Sep - Jun",
    duration: "3 Days",
    budget: "Budget",
    rating: "4.8",
    description: "Holy Ganges rafting, yoga retreats, and evening Ganga Aarti."
  }
];

const SUGGESTION_CHIPS = [
  { label: "🏖 Beaches", query: "Goa", style: "Relaxation" },
  { label: "🏔 Mountains", query: "Manali", style: "Adventure" },
  { label: "🛕 Temples", query: "Varanasi", style: "Spiritual" },
  { label: "🍛 Food Trails", query: "Delhi Food Trail", style: "Food Trail" },
  { label: "🐅 Wildlife", query: "Ranthambore Safari", style: "Wildlife" },
  { label: "💑 Honeymoon", query: "Kerala Honeymoon", style: "Honeymoon" },
  { label: "Family Trip", query: "Jaipur Udaipur Tour", style: "Family" },
  { label: "🎒 Backpacking", query: "Leh Ladakh Ride", style: "Backpacking" },
  { label: "🚗 Road Trip", query: "Western Ghats Drive", style: "Road Trip" }
];

const TRAVEL_STYLES = [
  { id: "Honeymoon", label: "Honeymoon", icon: Heart, desc: "Romantic trails, couples massage, private dinners, and sunset views." },
  { id: "Family", label: "Family", icon: Users, desc: "Kid-safe attractions, comfortable lodging, and group activities." },
  { id: "Backpacking", label: "Backpacking", icon: Footprints, desc: "Hostels, street food, budget transport, and offbeat trails." },
  { id: "Spiritual", label: "Spiritual", icon: Sparkles, desc: "Sacred temples, quiet yoga centers, and local cultural rituals." },
  { id: "Food Trail", label: "Food Trail", icon: Utensils, desc: "Iconic regional cuisines, famous street food stalls, and sweet shops." },
  { id: "Road Trip", label: "Road Trip", icon: Compass, desc: "Scenic highway routes, local dhabas, and viewpoint stops." },
  { id: "Photography", label: "Photography", icon: Camera, desc: "Golden hour viewpoints, colorful architectural sites, and landmarks." },
  { id: "Adventure", label: "Adventure", icon: Flame, desc: "Trekking, river rafting, paragliding, and camping under stars." }
];

const INDIAN_DESTINATIONS = [
  "Jaipur, Rajasthan",
  "Leh-Ladakh",
  "Ranthambore, Rajasthan",
  "Kashmir",
  "Pondicherry",
  "Varanasi, Uttar Pradesh",
  "Goa",
  "Kerala Backwaters",
  "Manali, Himachal Pradesh",
  "Agra, Uttar Pradesh",
  "Darjeeling, West Bengal",
  "Ooty, Tamil Nadu",
  "Mumbai, Maharashtra",
  "Amritsar, Punjab",
  "Hampi, Karnataka",
  "Coorg, Karnataka",
  "Rishikesh, Uttarakhand",
  "Shimla, Himachal Pradesh",
  "Munnar, Kerala",
  "Kolkata, West Bengal",
  "Jaisalmer, Rajasthan"
];

const REGIONAL_CUISINES = [
  {
    name: "Hyderabadi Biryani",
    origin: "Telangana / Andhra",
    desc: "Fragrant basmati rice layered with slow-cooked spiced meat and pure saffron.",
    icon: "🍛",
    img: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Amritsari Kulcha",
    origin: "Punjab",
    desc: "Crispy, butter-soaked tandoor flatbread stuffed with highly spiced potatoes.",
    icon: "🧈",
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Mysore Dosa",
    origin: "Karnataka",
    desc: "Super crispy rice crepe smeared with hot red chili chutney and stuffed with spiced potato.",
    icon: "🥞",
    img: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Bengali Fish Curry",
    origin: "West Bengal",
    desc: "Tender local fish simmered with pungent mustard paste and fresh green chilies.",
    icon: "🐟",
    img: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Rajasthani Dal Baati",
    origin: "Rajasthan",
    desc: "Baked wheat rolls served with hot mixed lentil curry and premium ghee.",
    icon: "🍲",
    img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Kashmiri Rogan Josh",
    origin: "Kashmir",
    desc: "Robust, slow-cooked lamb curry aromatized with Kashmiri red chilies and fennel.",
    icon: "🍛",
    img: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80"
  }
];

const SEASONAL_TIMELINE = [
  { season: "Summer ☀️", period: "April - June", focus: "Hill stations & Himalayan peaks", recommendations: "Shimla, Manali, Leh Ladakh, Munnar, Ooty, Darjeeling" },
  { season: "Monsoon 🌧", period: "July - September", focus: "Lush Western Ghats & backwaters", recommendations: "Munnar, Coorg, Wayanad, Athirappilly, Udaipur lakes" },
  { season: "Winter ❄️", period: "October - March", focus: "Rajasthan deserts, golden beaches & Kashmir snow", recommendations: "Jaipur, Jaisalmer, Goa, Andaman islands, Gulmarg, Pondicherry" }
];

const REVIEWS = [
  { name: "Rohan S.", location: "Mumbai", rating: 5, quote: "Planned my Himachal trip in less than a minute. The recommendations were incredibly accurate!" },
  { name: "Priya M.", location: "Bangalore", rating: 5, quote: "The itinerary was surprisingly detailed and saved hours of planning. Loved the local food suggestions!" },
  { name: "Aniket K.", location: "Delhi", rating: 5, quote: "Loved the PDF itinerary—it was easy to carry during my Goa trip and included amazing offbeat spots." }
];

const LOADING_MESSAGES = [
  "Mapping out your Incredible India routing...",
  "Consulting local guides & trusted heritage sources...",
  "Scouting highly recommended authentic dining spots...",
  "Gathering real, verified destination attractions...",
  "Calculating daily cost estimate break-downs...",
  "Curating essential safety and travel etiquette tips..."
];

export default function App() {
  const getTodayString = () => {
    const d = new Date("2026-07-15");
    return d.toISOString().split("T")[0];
  };

  const addDaysToDateStr = (dateStr: string, daysToAdd: number) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + daysToAdd - 1);
    return date.toISOString().split("T")[0];
  };

  // State Management
  const [formData, setFormData] = useState<FormInputs>({
    destination: "",
    days: 5,
    budget: "Mid-range",
    travelers: 2,
    travelStyle: "Honeymoon",
    startDate: getTodayString(),
    endDate: addDaysToDateStr(getTodayString(), 5)
  });

  const [promptQuery, setPromptQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [itinerary, setItinerary] = useState<TravelItinerary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<number | "all">("all");
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [checkedActivities, setCheckedActivities] = useState<Record<string, boolean>>({});

  // Interactive Timeline Season Select
  const [activeSeason, setActiveSeason] = useState(2); // Winter default


  // Watch Demo Simulation Modal
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Custom states for production Firebase Integration
  const [activeTab, setActiveTab] = useState<"planner" | "dashboard">("planner");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authName, setAuthName] = useState("");
  const [authRememberMe, setAuthRememberMe] = useState(true);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };


  // Chat Companion State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "Namaste! 🙏 I am Yatrik AI, your intelligent travel companion. I am here to help you plan personalized trips across India, suggest offbeat destinations, recommend authentic regional cuisines, optimize your budget, and help you download complete travel plans.\n\nWhere would you like to explore next?"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Autocomplete Suggestions State
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
  const [showPromptSuggestions, setShowPromptSuggestions] = useState(false);

  // Refs for smooth scroll
  const formRef = useRef<HTMLDivElement>(null);
  const popularRef = useRef<HTMLDivElement>(null);
  const pendingTripRef = useRef<TravelItinerary | null>(null);

  // Load trips and user profiles
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          let profile = await getUserProfile(currentUser.uid);
          if (!profile) {
            profile = await createUserProfile(
              currentUser.uid,
              currentUser.displayName || "Traveler",
              currentUser.email || "",
              currentUser.photoURL || "",
              currentUser.providerData[0]?.providerId || "password"
            );
          }
          setUserProfile(profile);

          // Save pending trip to Firebase if one exists
          if (pendingTripRef.current) {
            const tripData = pendingTripRef.current;
            pendingTripRef.current = null; // Clear immediately to prevent duplicate triggers

            const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const richTrip: Omit<TripPlan, "createdAt" | "updatedAt"> = {
              tripId,
              destination: tripData.destination || "India",
              startingLocation: "",
              startDate: tripData.startDate || "",
              endDate: tripData.endDate || "",
              numberOfDays: tripData.durationDays || 3,
              budget: tripData.budget || "Mid-range",
              travelers: String(tripData.travelers || 1),
              travelStyle: tripData.travelStyle || "Leisure",
              interests: [],
              generatedItinerary: tripData,
              tripStatus: "upcoming",
            };
            await saveTrip(currentUser.uid, richTrip);
            showToast("Trip saved to your cloud profile!", "success");
          }

          fetchTripsFromFirestore(currentUser.uid);
        } catch (e) {
          console.error("Error loading user profile:", e);
        }
      } else {
        setUserProfile(null);
        loadLocalTrips();
      }
    });
    return () => unsubscribe();
  }, []);

  const loadLocalTrips = () => {
    // Local storage is disabled per requirements
    setSavedTrips([]);
  };

  const fetchTripsFromFirestore = async (uid: string) => {
    try {
      const trips = await getUserTrips(uid);
      const mappedTrips: SavedTrip[] = trips.map((t) => ({
        id: t.tripId,
        timestamp: t.createdAt?.seconds ? t.createdAt.seconds * 1000 : Date.now(),
        userId: uid,
        data: t.generatedItinerary as TravelItinerary,
      }));
      // Sort newest first client-side
      mappedTrips.sort((a, b) => b.timestamp - a.timestamp);
      setSavedTrips(mappedTrips);
    } catch (e) {
      console.error("Error fetching trips from Firestore:", e);
      loadLocalTrips();
    }
  };


  // Loading spinner rotation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Handle Date synchronization
  const handleStartDateChange = (val: string) => {
    setFormData((prev) => {
      const end = addDaysToDateStr(val, prev.days);
      return { ...prev, startDate: val, endDate: end };
    });
  };

  const handleEndDateChange = (val: string) => {
    setFormData((prev) => {
      const startObj = new Date(prev.startDate);
      const endObj = new Date(val);
      const diffTime = endObj.getTime() - startObj.getTime();
      let calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (calculatedDays < 1) calculatedDays = 1;
      if (calculatedDays > 14) calculatedDays = 14;
      const realEnd = addDaysToDateStr(prev.startDate, calculatedDays);
      return { ...prev, days: calculatedDays, endDate: realEnd };
    });
  };

  const handleDaysChange = (newDays: number) => {
    const validated = Math.max(1, Math.min(14, newDays));
    setFormData((prev) => {
      const end = addDaysToDateStr(prev.startDate, validated);
      return { ...prev, days: validated, endDate: end };
    });
  };

  // Quick select prompt chips
  const handleChipClick = (chip: typeof SUGGESTION_CHIPS[0]) => {
    setPromptQuery(`Plan a ${formData.days}-day trip to ${chip.query} under ${formData.budget === "Budget" ? "₹25,000" : formData.budget === "Mid-range" ? "₹50,000" : "₹1,00,000"}`);
    setFormData((prev) => ({
      ...prev,
      destination: chip.query,
      travelStyle: chip.style
    }));
    scrollToForm();
  };

  const handlePopularCardClick = (dest: typeof POPULAR_DESTINATIONS[0]) => {
    setFormData({
      destination: dest.name,
      days: dest.duration.toLowerCase().includes("days") ? parseInt(dest.duration) : 5,
      budget: dest.budget as any,
      travelers: 2,
      travelStyle: dest.style,
      startDate: getTodayString(),
      endDate: addDaysToDateStr(getTodayString(), dest.duration.toLowerCase().includes("days") ? parseInt(dest.duration) : 5)
    });
    setPromptQuery(`Plan a trip to ${dest.name} optimized for ${dest.style}`);
    scrollToForm();
  };

  // Send chat message
  const handleSendChatMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    const newUserMessage = { role: "user" as const, content: textToSend };
    setChatMessages(prev => [...prev, newUserMessage]);
    if (!customText) setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, newUserMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Chat assistant error");
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.text }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: "Oops! I encountered an issue connecting to the travel grid. Please try sending your query again."
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Autocomplete destination changes
  const handleDestinationChange = (val: string) => {
    setFormData(prev => ({ ...prev, destination: val }));
    const filtered = INDIAN_DESTINATIONS.filter(d =>
      d.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 5);
    setDestSuggestions(filtered);
    setShowDestSuggestions(val.trim().length > 0 && filtered.length > 0);
  };

  // Autocomplete prompt query changes
  const handlePromptQueryChange = (val: string) => {
    setPromptQuery(val);

    // Auto-extract destination from prompt if we match a known destination
    const matched = INDIAN_DESTINATIONS.find(d => {
      const parts = d.split(",");
      const cityName = parts[0].trim().toLowerCase();
      return val.toLowerCase().includes(cityName);
    });
    if (matched) {
      setFormData(prev => ({ ...prev, destination: matched.split(",")[0].trim() }));
    }

    const filtered = INDIAN_DESTINATIONS.filter(d =>
      d.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 5);
    setPromptSuggestions(filtered);
    setShowPromptSuggestions(val.trim().length > 0 && filtered.length > 0);
  };

  // Simulated Watch Demo Logic
  const startDemo = () => {
    setDemoStep(0);
    setDemoModalOpen(true);
  };

  useEffect(() => {
    if (!demoModalOpen) return;
    let timer: NodeJS.Timeout;
    if (demoStep === 0) {
      timer = setTimeout(() => setDemoStep(1), 1800);
    } else if (demoStep === 1) {
      timer = setTimeout(() => setDemoStep(2), 2000);
    } else if (demoStep === 2) {
      timer = setTimeout(() => setDemoStep(3), 2000);
    } else if (demoStep === 3) {
      timer = setTimeout(() => setDemoStep(4), 1800);
    }
    return () => clearTimeout(timer);
  }, [demoModalOpen, demoStep]);

  // Submit Itinerary Generation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.destination.trim()) {
      setError("Please specify an Indian destination first.");
      return;
    }

    setLoading(true);
    setLoadingMsgIdx(0);
    setError(null);
    setItinerary(null);
    setActiveDay("all");
    setCheckedActivities({});

    try {
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = "An unexpected error occurred while planning your trip.";
        try {
          const errData = JSON.parse(responseText);
          errorMessage = errData.error || errorMessage;
        } catch {
          errorMessage = `Server Error (${response.status}): ${responseText.substring(0, 200)}`;
        }
        throw new Error(errorMessage);
      }

      let data: TravelItinerary;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`Invalid response from server: ${responseText.substring(0, 200)}`);
      }
      data.startDate = formData.startDate;
      data.endDate = formData.endDate;

      setItinerary(data);
      await saveTripToHistory(data);

      // Smooth scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById("itinerary-results");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);

    } catch (err: any) {
      setError(err.message || "Failed to generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveTripToHistory = async (tripData: TravelItinerary) => {
    if (user) {
      try {
        const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const richTrip: Omit<TripPlan, "createdAt" | "updatedAt"> = {
          tripId,
          destination: tripData.destination || "India",
          startingLocation: "",
          startDate: tripData.startDate || "",
          endDate: tripData.endDate || "",
          numberOfDays: tripData.durationDays || 3,
          budget: tripData.budget || "Mid-range",
          travelers: String(tripData.travelers || 1),
          travelStyle: tripData.travelStyle || "Leisure",
          interests: [],
          generatedItinerary: tripData,
          tripStatus: "upcoming",
        };
        await saveTrip(user.uid, richTrip);

        const newTrip: SavedTrip = {
          id: tripId,
          timestamp: Date.now(),
          userId: user.uid,
          data: tripData,
        };
        setSavedTrips((prev) => {
          const filtered = prev.filter((t) => t.data.tripTitle !== tripData.tripTitle);
          return [newTrip, ...filtered].slice(0, 15);
        });
        showToast("Trip saved to your cloud profile!", "success");
      } catch (e) {
        console.error("Error saving trip to Firestore:", e);
        showToast("Failed to save trip to cloud.", "error");
      }
    } else {
      pendingTripRef.current = tripData;
      setAuthModalOpen(true);
      showToast("Please sign in or create an account to save this itinerary.", "info");
    }
  };

  const deleteSavedTrip = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) {
      try {
        await deleteTrip(user.uid, id);
        setSavedTrips((prev) => prev.filter((t) => t.id !== id));
        showToast("Trip deleted from cloud!", "success");
      } catch (e) {
        console.error("Error deleting trip from Firestore:", e);
        showToast("Failed to delete trip from cloud.", "error");
      }
    } else {
      setSavedTrips((prev) => prev.filter((t) => t.id !== id));
      showToast("Trip removed.", "info");
    }
  };

  const selectSavedTrip = (trip: SavedTrip) => {
    setItinerary(trip.data);
    setActiveDay("all");
    setCheckedActivities({});
    setError(null);
    setTimeout(() => {
      const resultsEl = document.getElementById("itinerary-results");
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  };

  // Auth Functions
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (forgotPasswordMode) {
        await triggerPasswordReset(authEmail);
        showToast("Password reset link sent to your email!", "info");
        setForgotPasswordMode(false);
      } else {
        await loginWithEmail(authEmail, authPassword, authRememberMe);
        showToast("Logged in successfully!", "success");
        setAuthModalOpen(false);
        resetAuthFields();
      }
    } catch (err: any) {
      const errMsg = err.message || "Authentication failed.";
      setAuthError(errMsg);
      showToast(errMsg, "error");
      if (errMsg.includes("Account not found")) {
        setAuthMode("signup");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authName.trim()) {
      setAuthError("Full Name is required.");
      return;
    }
    if (authPassword !== authConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    if (authPassword.length < 8) {
      setAuthError("Password must be at least 8 characters.");
      return;
    }
    setAuthLoading(true);
    try {
      await signUpWithEmail(authName, authEmail, authPassword);
      showToast("Account created and logged in successfully!", "success");
      setAuthModalOpen(false);
      resetAuthFields();
    } catch (err: any) {
      setAuthError(err.message || "Registration failed.");
      showToast(err.message || "Signup failed.", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await loginWithGoogle();
      showToast("Logged in successfully with Google!", "success");
      setAuthModalOpen(false);
      resetAuthFields();
    } catch (err: any) {
      setAuthError(err.message || "Google Sign-In failed.");
      showToast(err.message || "Google Login failed.", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setItinerary(null);
      setActiveTab("planner");
      showToast("Logged out successfully.", "info");
    } catch (err: any) {
      console.error("Error signing out:", err);
      showToast("Sign out failed.", "error");
    }
  };

  // Dashboard Helpers
  const handleDuplicateTrip = async (originalTrip: SavedTrip) => {
    if (!user) return;
    try {
      const tripPlan: TripPlan = {
        tripId: originalTrip.id,
        destination: originalTrip.data.destination || "",
        startingLocation: "",
        startDate: originalTrip.data.startDate || "",
        endDate: originalTrip.data.endDate || "",
        numberOfDays: originalTrip.data.durationDays || 3,
        budget: originalTrip.data.budget || "Mid-range",
        travelers: String(originalTrip.data.travelers || 1),
        travelStyle: originalTrip.data.travelStyle || "Leisure",
        interests: [],
        generatedItinerary: originalTrip.data,
        tripStatus: "upcoming",
      };
      const duplicatedId = await duplicateTrip(user.uid, tripPlan);

      const newSavedTrip: SavedTrip = {
        id: duplicatedId,
        timestamp: Date.now(),
        userId: user.uid,
        data: {
          ...originalTrip.data,
          tripTitle: `${originalTrip.data.tripTitle} (Copy)`,
          destination: `${originalTrip.data.destination} (Copy)`,
        }
      };
      setSavedTrips((prev) => [newSavedTrip, ...prev]);
      showToast("Trip duplicated successfully!", "success");
    } catch (e) {
      console.error("Error duplicating trip:", e);
      showToast("Failed to duplicate trip.", "error");
    }
  };

  const handleEditTripTitle = async (tripId: string, newTitle: string) => {
    if (!user) return;
    try {
      const trip = savedTrips.find((t) => t.id === tripId);
      if (!trip) return;

      const updatedData = {
        ...trip.data,
        tripTitle: newTitle,
      };

      await updateTrip(user.uid, tripId, {
        generatedItinerary: updatedData,
      });

      setSavedTrips((prev) =>
        prev.map((t) => (t.id === tripId ? { ...t, data: updatedData } : t))
      );
      showToast("Trip title updated successfully!", "success");
    } catch (e) {
      console.error("Error editing trip:", e);
      showToast("Failed to update trip title.", "error");
    }
  };

  const resetAuthFields = () => {
    setAuthEmail("");
    setAuthPassword("");
    setAuthConfirmPassword("");
    setAuthError(null);
  };

  const getDayCalendarDate = (startDateStr: string | undefined, dayNum: number) => {
    if (!startDateStr) return "";
    const date = new Date(startDateStr);
    date.setDate(date.getDate() + dayNum - 1);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToPopular = () => {
    popularRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleActivity = (day: number, idx: number) => {
    const actKey = `${day}-${idx}`;
    setCheckedActivities((prev) => ({
      ...prev,
      [actKey]: !prev[actKey]
    }));
  };

  // PDF Generation with jsPDF
  const downloadPdf = (itin: TravelItinerary) => {
    const doc = new jsPDF();

    // Top primary accent block
    doc.setFillColor(15, 118, 110); // Yatrik Deep Teal
    doc.rect(0, 0, 210, 48, "F");

    // Header decorative bar on top
    doc.setFillColor(255, 107, 53); // Sunrise Orange
    doc.rect(0, 0, 210, 4, "F");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("YATRIK AI - DIGITAL TRAVEL COMPANION", 15, 20);

    // Subtitle / tagline
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(254, 215, 170); // Light orange text
    doc.text("DIGITAL INDIA EXPLORER ENGINE • CUSTOM PERSONALIZED ITINERARY", 15, 26);

    // Decorative white separator line
    doc.setDrawColor(255, 255, 255, 0.2);
    doc.line(15, 30, 195, 30);

    // Secondary tagline
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text("Incredible India Travel Experience Crafted Just For You", 15, 38);

    // Soft slate container for metadata
    doc.setFillColor(248, 250, 252); // F8FAFC
    doc.rect(15, 58, 180, 36, "F");
    doc.setDrawColor(226, 232, 240); // E2E8F0
    doc.rect(15, 58, 180, 36, "S");

    // Add a left accent bar to the card
    doc.setFillColor(255, 107, 53); // Orange Accent
    doc.rect(15, 58, 3, 36, "F");

    // Title inside card
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42); // 0F172A
    const splitTitle = doc.splitTextToSize(itin.tripTitle, 165);
    doc.text(splitTitle, 23, 67);

    // Grid metadata display
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // 475569

    // Left column of metadata
    doc.setFont("helvetica", "bold");
    doc.text("Destination:", 23, 78);
    doc.setFont("helvetica", "normal");
    doc.text(itin.destination, 45, 78);

    doc.setFont("helvetica", "bold");
    doc.text("Travel Style:", 23, 85);
    doc.setFont("helvetica", "normal");
    doc.text(itin.travelStyle, 45, 85);

    // Right column of metadata
    doc.setFont("helvetica", "bold");
    doc.text("Duration:", 110, 78);
    doc.setFont("helvetica", "normal");
    doc.text(`${itin.durationDays} Days`, 130, 78);

    doc.setFont("helvetica", "bold");
    doc.text("Budget Level:", 110, 85);
    doc.setFont("helvetica", "normal");
    doc.text(itin.budget, 130, 85);

    let y = 105;

    const checkPage = (neededHeight: number) => {
      if (y + neededHeight > 270) {
        // Draw elegant footer on current page before adding a new one
        doc.setDrawColor(241, 245, 249);
        doc.line(15, 278, 195, 278);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text("Generated by Yatrik AI - Digital India Explorer Engine", 15, 285);
        doc.text("Page " + doc.getCurrentPageInfo().pageNumber, 195, 285, { align: "right" });

        doc.addPage();
        y = 20;
      }
    };

    itin.itinerary.forEach((day) => {
      // Day Header & Badge
      checkPage(25);

      // Pill badge for the Day index
      doc.setFillColor(15, 118, 110); // Teal badge
      doc.rect(15, y, 22, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(`DAY ${day.day}`, 19, y + 4.8);

      // Day title next to the badge
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(day.title, 42, y + 5.2);

      // Light line divider under the day title
      doc.setDrawColor(241, 245, 249);
      doc.line(15, y + 9, 195, y + 9);

      y += 15;

      // 1. Key Attractions Visited
      checkPage(18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 107, 53); // Orange accent for heading
      doc.text("» KEY ATTRACTIONS TO VISIT", 15, y);
      y += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85); // Slate-700
      day.attractions.forEach((attraction) => {
        checkPage(10);
        const splitText = doc.splitTextToSize(`• ${attraction.trim()}`, 172);
        doc.text(splitText, 18, y);
        y += (splitText.length * 4.8);
      });

      // 2. Daily Timeline & Suggested Activities
      y += 3;
      checkPage(18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 118, 110); // Teal for activities
      doc.text("» SUGGESTED ACTIVITIES & PACING", 15, y);
      y += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      day.activities.forEach((activity) => {
        checkPage(10);
        const splitText = doc.splitTextToSize(`• ${activity.trim()}`, 172);
        doc.text(splitText, 18, y);
        y += (splitText.length * 4.8);
      });

      // 3. Regional Cuisines & Dining
      y += 3;
      checkPage(18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 118, 110);
      doc.text("» LOCAL DINING & FOOD RECOMMENDATIONS", 15, y);
      y += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      day.foodRecommendations.forEach((food) => {
        checkPage(10);
        const splitText = doc.splitTextToSize(`• ${food.trim()}`, 172);
        doc.text(splitText, 18, y);
        y += (splitText.length * 4.8);
      });

      // 4. Budget Estimation
      y += 3;
      checkPage(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // Slate Gray label
      doc.text("Estimated Daily Cost Range:", 15, y);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 118, 110); // Teal for price
      doc.text(day.estimatedCostRange || "Flexible / Moderate", 65, y);
      y += 14; // Gap before next day
    });

    // Travel Tips Section
    if (itin.travelTips && itin.travelTips.length > 0) {
      checkPage(25);

      doc.setFillColor(15, 118, 110); // Yatrik Teal
      doc.rect(15, y, 180, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("YATRIK AI TRAVEL ADVISORY & LOCAL TIPS", 18, y + 5.5);
      y += 13;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      itin.travelTips.forEach((tip) => {
        const cleanTip = tip.replace(/^[•\s*-]+/, "").trim(); // strip any bullet points if the model already added them
        const splitTip = doc.splitTextToSize(`• ${cleanTip}`, 172);
        checkPage(splitTip.length * 4.8 + 2);
        doc.text(splitTip, 15, y);
        y += (splitTip.length * 4.8) + 2.5;
      });
    }

    // Draw footer on the final page
    doc.setDrawColor(241, 245, 249);
    doc.line(15, 278, 195, 278);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Generated by Yatrik AI - Digital India Explorer Engine", 15, 285);
    doc.text("Page " + doc.getCurrentPageInfo().pageNumber, 195, 285, { align: "right" });

    doc.save(`Yatrik-AI-${itin.destination.replace(/\s+/g, "-")}-Itinerary.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#FF6B35]/20 selection:text-[#FF6B35]">
      {/* HEADER */}
      <header className="no-print sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FF6B35] text-white rounded-2xl shadow-lg shadow-orange-500/10">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-display tracking-tight text-[#0F172A] flex items-center gap-1.5">
                  Yatrik <span className="text-[#FF6B35]">AI</span>
                </h1>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold font-mono">
                Digital India Explorer Engine
              </p>
            </div>
          </div>

          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-600">
            <button
              onClick={() => {
                setActiveTab("planner");
                setTimeout(scrollToPopular, 100);
              }}
              className={`hover:text-[#FF6B35] font-semibold transition-colors cursor-pointer ${activeTab === "planner" ? "text-[#0F172A]" : "text-slate-500"
                }`}
            >
              Destinations
            </button>
            <button
              onClick={() => {
                setActiveTab("planner");
                setTimeout(scrollToForm, 100);
              }}
              className={`hover:text-[#FF6B35] font-semibold transition-colors cursor-pointer flex items-center gap-1 py-1 ${activeTab === "planner" ? "text-[#FF6B35] font-bold border-b-2 border-[#FF6B35]" : "text-slate-600"
                }`}
            >
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              <span>AI Planner</span>
            </button>

            {user && (
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`hover:text-[#FF6B35] font-semibold transition-colors cursor-pointer flex items-center gap-1 py-1 ${activeTab === "dashboard" ? "text-[#FF6B35] font-bold border-b-2 border-[#FF6B35]" : "text-slate-600"
                  }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>My Dashboard</span>
              </button>
            )}


            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl cursor-pointer transition-all focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF6B35] to-orange-400 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-orange-500/10">
                    {(userProfile?.name || user?.displayName || user?.email || "T").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-700 max-w-[100px] truncate">
                    {userProfile?.name || user?.displayName || user?.email?.split("@")[0] || "Traveler"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <>
                      {/* Backdrop to close */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-2 text-left"
                      >
                        <div className="px-4 py-2 border-b border-slate-50">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Logged in as</p>
                          <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                            {userProfile?.name || user?.displayName || user?.email?.split("@")[0] || "Traveler"}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab("dashboard");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                          <span>My Saved Trips</span>
                        </button>
                        <button
                          onClick={() => {
                            handleSignOut();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors border-t border-slate-50"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("signin");
                  setAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl font-bold tracking-wide transition-all shadow-md shadow-emerald-700/10 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-[#FF6B35] focus:outline-none rounded-xl cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-40 bg-black/40 md:hidden"
              />

              {/* Slide Drawer */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 z-50 w-72 max-w-full bg-white shadow-2xl p-6 flex flex-col justify-between md:hidden"
              >
                <div className="space-y-6">
                  {/* Brand & Close button */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="text-xl font-bold font-display text-[#0F172A]">
                      Yatrik <span className="text-[#FF6B35]">AI</span>
                    </span>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Menu Items */}
                  <div className="flex flex-col gap-4 text-sm font-semibold text-slate-700">
                    <button
                      onClick={() => {
                        setActiveTab("planner");
                        setMobileMenuOpen(false);
                        setTimeout(scrollToPopular, 100);
                      }}
                      className={`text-left py-2 px-3 rounded-xl transition-all ${activeTab === "planner" ? "bg-orange-50 text-[#FF6B35]" : "hover:bg-slate-50 text-slate-600"
                        }`}
                    >
                      Destinations
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("planner");
                        setMobileMenuOpen(false);
                        setTimeout(scrollToForm, 100);
                      }}
                      className={`text-left py-2 px-3 rounded-xl transition-all flex items-center gap-2 ${activeTab === "planner" ? "bg-orange-50 text-[#FF6B35]" : "hover:bg-slate-50 text-slate-600"
                        }`}
                    >
                      <Compass className="w-4 h-4 text-[#FF6B35] animate-spin-slow" />
                      <span>AI Planner</span>
                    </button>

                    {user && (
                      <button
                        onClick={() => {
                          setActiveTab("dashboard");
                          setMobileMenuOpen(false);
                        }}
                        className={`text-left py-2 px-3 rounded-xl transition-all flex items-center gap-2 ${activeTab === "dashboard" ? "bg-teal-50/50 text-[#0F766E]" : "hover:bg-slate-50 text-slate-600"
                          }`}
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#0F766E]" />
                        <span>My Dashboard</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* User Info / Actions in Mobile Menu */}
                <div className="pt-6 border-t border-slate-100">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                            {user.email || "Active User"}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-bold font-mono">Cloud Synced</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold transition-all cursor-pointer border border-red-200 text-xs"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAuthMode("signin");
                        setAuthModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl font-bold transition-all cursor-pointer shadow-md text-xs"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Log In / Sign Up</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {activeTab === "planner" ? (
        <>
          {/* HERO SECTION */}
          <section className="no-print relative overflow-hidden pt-8 pb-16 md:py-20 lg:py-24 bg-gradient-to-b from-white via-[#F8FAFC] to-white border-b border-slate-100">
            {/* Floating Clouds Background Animation */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <motion.div
                animate={{ x: ["-10%", "110%"] }}
                transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                className="absolute top-12 left-0 w-44 h-16 opacity-30 bg-radial from-slate-200 to-transparent blur-xl rounded-full"
              />
              <motion.div
                animate={{ x: ["110%", "-10%"] }}
                transition={{ repeat: Infinity, duration: 55, ease: "linear" }}
                className="absolute top-1/2 left-0 w-64 h-24 opacity-25 bg-radial from-slate-300 to-transparent blur-2xl rounded-full"
              />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

                {/* Left Column Content */}
                <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full text-xs font-bold text-[#FF6B35]">
                    <Flame className="w-4 h-4 text-[#FF6B35] animate-pulse" />
                    <span>Next-Gen AI Itinerary Planner</span>
                  </div>

                  <div className="space-y-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight text-[#0F172A] leading-[1.1] max-w-2xl">
                      Explore India Like <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] via-[#2563EB] to-[#0F766E]">Never Before</span>
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed font-sans max-w-xl mx-auto lg:mx-0">
                      From the Himalayas to the Backwaters—Your Perfect Indian Journey, Planned by AI in under 30 seconds. Custom daily flows tailored beautifully to your budget.
                    </p>
                  </div>

                  {/* Grid Checkmarks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4 w-full max-w-lg text-left">
                    {[
                      { label: "Day-wise itinerary", desc: "Hour-by-hour pacing" },
                      { label: "Budget planner", desc: "Detailed cost breakups" },
                      { label: "Best attractions", desc: "Real, verified hotspots" },
                      { label: "Local food recommendations", desc: "Regional culinary treats" },
                      { label: "Hotels & transport", desc: "Optimal travel options" },
                      { label: "Download PDF", desc: "Save for offline travels" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 shrink-0">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{item.label}</h4>
                          <p className="text-[11px] text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 pt-2 justify-center lg:justify-start">
                    <button
                      onClick={scrollToForm}
                      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white font-bold rounded-2xl tracking-wide shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 group text-xs sm:text-sm"
                    >
                      <span>🧡 Plan My Indian Escape</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
                    </button>

                    <button
                      onClick={startDemo}
                      className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold rounded-2xl tracking-wide transition-all hover:border-slate-300 shadow-sm cursor-pointer flex items-center justify-center gap-2 group text-xs sm:text-sm"
                    >
                      <Play className="w-4 h-4 text-[#2563EB] fill-[#2563EB]/20 group-hover:scale-110 transition-transform shrink-0" />
                      <span>Watch Demo</span>
                    </button>
                  </div>
                </div>

                {/* Right Column Interactive Highlights Widget */}
                <div className="lg:col-span-6 relative flex flex-col items-center">

                  {/* Map background glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-tr from-orange-100 via-blue-50 to-emerald-100 blur-3xl opacity-60 rounded-full -z-10" />

                  {/* STYLIZED SCENIC ILLUSTRATION BOX */}
                  <div className="relative w-full max-w-[480px] aspect-[4/5] bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-slate-100/80 shadow-2xl overflow-hidden flex flex-col justify-between">

                    <div className="flex justify-between items-start">
                      <div>

                        <h3 className="font-bold text-lg text-slate-800 mt-1">Real-time Route Highlights</h3>
                      </div>
                    </div>

                    {/* Styled Image Canvas wrapper */}
                    <div className="relative w-full flex-1 my-4 rounded-2xl overflow-hidden border border-slate-100 shadow-inner group">
                      <img
                        src={heroIndianDestinations}
                        alt="Yatrik AI Live Travel Highlights"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      />
                    </div>

                    {/* Auto-Populate Route Option Trigger Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setPromptQuery("Plan a 5-day trip to Varanasi, Jaipur and Agra");
                        setFormData(prev => ({
                          ...prev,
                          destination: "Varanasi, Jaipur, Agra",
                          days: 5,
                          travelStyle: "cultural"
                        }));
                        scrollToForm();
                      }}
                      className="w-full bg-[#F8FAFC] hover:bg-[#FF6B35]/10 hover:text-[#FF6B35] border border-slate-100 p-3.5 rounded-2xl transition-all flex items-center justify-between text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-[#FF6B35] group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Auto-Plan Golden Triangle Route</h4>
                          <p className="text-[10px] text-slate-500 font-medium">Pre-load multi-city stops shown in image</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* POPULAR DESTINATIONS GRID */}
          <section ref={popularRef} className="no-print py-16 bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block">
                  🚂 Handcrafted Popular Escapes
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-[#0F172A]">
                  12 Iconic Indian Destinations
                </h2>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                  Explore India's golden sand deserts, snow-capped ranges, and peaceful beaches. Click any destination card to load it directly into the AI Planner.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {POPULAR_DESTINATIONS.map((dest, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -6 }}
                    className="group bg-[#F8FAFC]/50 hover:bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-orange-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="relative aspect-video w-full overflow-hidden">
                      <img
                        src={dest.img}
                        alt={dest.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-800 flex items-center gap-1 border border-slate-100 shadow-xs">
                        <MapPin className="w-3 h-3 text-[#FF6B35]" />
                        <span>{dest.style}</span>
                      </div>
                      <div className="absolute top-3 right-3 bg-[#0F766E] text-white px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-md">
                        <Star className="w-3 h-3 fill-white stroke-none" />
                        <span>{dest.rating}</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-base text-[#0F172A] font-display group-hover:text-[#FF6B35] transition-colors">
                          {dest.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {dest.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                        <div>
                          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Best Time</p>
                          <p className="text-[#0F766E]">{dest.season}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Duration</p>
                          <p className="text-slate-800">{dest.duration}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Budget</p>
                          <p className="text-[#FF6B35]">{dest.budget}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handlePopularCardClick(dest)}
                        className="w-full mt-2.5 py-2.5 bg-slate-50 hover:bg-[#FF6B35] hover:text-white text-slate-800 text-xs font-bold rounded-xl border border-slate-100 hover:border-[#FF6B35] transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>🧡 AI Plan this Escape</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* AI PROMPT SECTION & PLANNER INPUT */}
          <section ref={formRef} className="no-print py-16 bg-gradient-to-b from-white to-[#F8FAFC] border-b border-slate-100">
            <div className="max-w-4xl mx-auto px-4 md:px-6">

              <div className="text-center max-w-xl mx-auto mb-10 space-y-2">

                <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[#0F172A]">
                  Where is your next Incredible India Escape?
                </h2>
                <p className="text-xs md:text-sm text-slate-500">
                  Type any Indian city, region or travel style below to dynamically prompt our custom Gemini Itinerary Engine.
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 space-y-6">

                {/* Custom search box prompt style */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                    Describe your dream itinerary or choose a chip below
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Plan a 5-day trip to Kerala under ₹25,000"
                      value={promptQuery}
                      onChange={(e) => handlePromptQueryChange(e.target.value)}
                      onFocus={() => setShowPromptSuggestions(promptQuery.trim().length > 0)}
                      onBlur={() => setTimeout(() => setShowPromptSuggestions(false), 250)}
                      className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-hidden focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all shadow-inner font-medium text-slate-800"
                    />
                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF6B35]" />

                    {showPromptSuggestions && promptSuggestions.length > 0 && (
                      <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-left divide-y divide-slate-100 max-h-60 overflow-y-auto">
                        {promptSuggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => {
                              const pureCity = sug.split(",")[0].trim();
                              setPromptQuery(`Plan a ${formData.days}-day trip to ${pureCity}`);
                              setFormData(prev => ({ ...prev, destination: pureCity }));
                              setShowPromptSuggestions(false);
                            }}
                            className="w-full px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#FF6B35] transition-colors flex items-center gap-2.5 text-left"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                            <span>Plan a trip to {sug}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Suggestions chips */}
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {SUGGESTION_CHIPS.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleChipClick(chip)}
                        className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-[#FF6B35]/10 hover:text-[#FF6B35] border border-slate-100 text-slate-600 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center gap-1 text-[11px]"
                      >
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Structured Planning Form */}
                <form onSubmit={handleSubmit} className="border-t border-slate-100 pt-6 space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Destination Input */}
                    <div className="space-y-2 relative">
                      <label htmlFor="destination" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#FF6B35]" />
                        Destination in India
                      </label>
                      <input
                        id="destination"
                        type="text"
                        required
                        placeholder="e.g. Kerala, Ladakh, Jaisalmer"
                        value={formData.destination}
                        onChange={(e) => handleDestinationChange(e.target.value)}
                        onFocus={() => setShowDestSuggestions(formData.destination.trim().length > 0)}
                        onBlur={() => setTimeout(() => setShowDestSuggestions(false), 250)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all font-medium"
                      />

                      {showDestSuggestions && destSuggestions.length > 0 && (
                        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-left divide-y divide-slate-100 max-h-60 overflow-y-auto">
                          {destSuggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => {
                                const pureCity = sug.split(",")[0].trim();
                                setFormData(prev => ({ ...prev, destination: pureCity }));
                                setShowDestSuggestions(false);
                              }}
                              className="w-full px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#FF6B35] transition-colors flex items-center gap-2.5 text-left"
                            >
                              <MapPin className="w-3.5 h-3.5 text-[#FF6B35] flex-shrink-0" />
                              <span>{sug}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Travel Style Selector */}
                    <div className="space-y-2">
                      <label htmlFor="travelStyle" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-[#0F766E]" />
                        Travel Style Preset
                      </label>
                      <select
                        id="travelStyle"
                        value={formData.travelStyle}
                        onChange={(e) => setFormData({ ...formData, travelStyle: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all font-medium"
                      >
                        {TRAVEL_STYLES.map((style) => (
                          <option key={style.id} value={style.id}>
                            {style.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Mutual Date pickers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="startDate" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                        Departure Date
                      </label>
                      <input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="endDate" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                        Return Date
                      </label>
                      <input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:outline-hidden focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Duration Slider and Budget Tiers */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Days Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#FF6B35]" />
                        Duration ({formData.days} Days)
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={formData.days <= 1}
                          onClick={() => handleDaysChange(formData.days - 1)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl text-slate-700 transition-colors cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-base text-slate-800 w-8 text-center">{formData.days}</span>
                        <button
                          type="button"
                          disabled={formData.days >= 14}
                          onClick={() => handleDaysChange(formData.days + 1)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl text-slate-700 transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Budget tier */}
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-[#0F766E]" />
                        Budget Preference Range
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {["Budget", "Mid-range", "Luxury"].map((tier) => {
                          const isSel = formData.budget === tier;
                          return (
                            <button
                              type="button"
                              key={tier}
                              onClick={() => setFormData({ ...formData, budget: tier as any })}
                              className={`py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all border cursor-pointer ${isSel
                                ? "bg-[#0F766E] border-[#0F766E] text-white shadow-md"
                                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                                }`}
                            >
                              {tier}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Number of Travelers Counter */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#2563EB]" />
                        Travelers Counting ({formData.travelers})
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={formData.travelers <= 1}
                          onClick={() => setFormData({ ...formData, travelers: Math.max(1, formData.travelers - 1) })}
                          className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl text-slate-700 transition-colors cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-slate-800 text-base">{formData.travelers} Traveler(s)</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, travelers: formData.travelers + 1 })}
                          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-6 py-3 sm:px-8 sm:py-3.5 bg-gradient-to-r from-[#FF6B35] to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white font-bold rounded-2xl tracking-wide shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 disabled:bg-slate-400 transition-all cursor-pointer flex items-center justify-center gap-2 group text-xs sm:text-sm"
                      >
                        {loading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-white animate-pulse" />
                            <span>🧡 Craft My Custom Itinerary</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Error messaging */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-700 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <p className="font-semibold">{error}</p>
                  </div>
                )}

                {/* Loading Overlay state */}
                {loading && (
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 flex flex-col items-center text-center space-y-4">
                    <div className="relative flex items-center justify-center">
                      <div className="w-16 h-16 border-4 border-slate-200 border-t-[#FF6B35] rounded-full animate-spin" />
                      <Compass className="w-8 h-8 text-[#0F766E] absolute animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-800">Yatrik AI is thinking...</h4>
                      <p className="text-xs text-[#0F766E] font-medium tracking-wide animate-pulse">
                        {LOADING_MESSAGES[loadingMsgIdx]}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* HISTORICAL ESCAPES (Saved list) */}
              {savedTrips.length > 0 && (
                <div className="mt-8 bg-white/70 backdrop-blur-md border border-slate-100 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[#0F172A] font-display font-semibold text-sm">
                      <History className="w-4 h-4 text-[#FF6B35]" />
                      <h3>Your Saved Custom Escapes ({savedTrips.length})</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                    {savedTrips.map((trip) => (
                      <div
                        key={trip.id}
                        onClick={() => selectSavedTrip(trip)}
                        className="flex items-center justify-between p-3 bg-[#F8FAFC]/80 hover:bg-[#FF6B35]/5 border border-slate-100 hover:border-orange-200 rounded-2xl cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-orange-50 text-[#FF6B35] rounded-xl font-bold text-xs">
                            🏝
                          </div>
                          <div className="text-left space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-[#FF6B35]">
                              {trip.data.tripTitle}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-semibold font-mono">
                              {trip.data.destination} • {trip.data.durationDays} Days
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => deleteSavedTrip(trip.id, e)}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <Dashboard
          savedTrips={savedTrips}
          setActiveTab={setActiveTab}
          scrollToForm={scrollToForm}
          downloadPdf={downloadPdf}
          handleDuplicateTrip={handleDuplicateTrip}
          handleEditTripTitle={handleEditTripTitle}
          deleteSavedTrip={deleteSavedTrip}
          setItinerary={setItinerary}
        />
      )}

      {/* ITINERARY PREVIEW & RESULTS COMPONENT */}
      {(activeTab === "planner" || itinerary) && (
        <section id="itinerary-results" className="py-16 bg-white border-b border-slate-100">
          <div className="print-container max-w-5xl mx-auto px-4 md:px-6">
            <AnimatePresence mode="wait">
              {itinerary ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Result header banner card */}
                  <div className="bg-gradient-to-r from-[#0F766E] to-[#0A524D] text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
                    {/* Flight lines and cloud vector in backdrop */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest text-emerald-100 border border-white/10">
                          <Sparkles className="w-3 h-3" />
                          AI GENERATED ESCAPE
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold font-display leading-tight">
                          {itinerary.tripTitle}
                        </h2>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-100">
                          <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            <MapPin className="w-3.5 h-3.5 text-[#FF6B35]" />
                            <span>{itinerary.destination}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                            <span>{itinerary.durationDays} Days</span>
                          </div>
                          {itinerary.startDate && (
                            <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                              <Clock className="w-3.5 h-3.5 text-[#FF6B35]" />
                              <span>
                                {getDayCalendarDate(itinerary.startDate, 1)} — {getDayCalendarDate(itinerary.startDate, itinerary.durationDays)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            <IndianRupee className="w-3.5 h-3.5 text-[#FF6B35]" />
                            <span>{itinerary.budget}</span>
                          </div>
                        </div>
                      </div>

                      <div className="no-print flex items-center gap-3 shrink-0">
                        {(() => {
                          const isAlreadySaved = savedTrips.some(
                            (t) => t.data.tripTitle === itinerary.tripTitle ||
                              (t.data.destination === itinerary.destination && t.data.durationDays === itinerary.durationDays)
                          );
                          return (
                            <button
                              onClick={async () => {
                                if (isAlreadySaved) return;
                                await saveTripToHistory(itinerary);
                              }}
                              disabled={isAlreadySaved}
                              className={`px-4 py-2.5 sm:px-5 sm:py-3 font-bold rounded-2xl text-[11px] sm:text-xs tracking-wide shadow-lg transition-all flex items-center gap-2 cursor-pointer border ${isAlreadySaved
                                ? "bg-emerald-500/20 text-white border-emerald-500/30 cursor-default"
                                : "bg-[#FF6B35] hover:bg-orange-600 text-white border-[#FF6B35] hover:border-orange-600"
                                }`}
                            >
                              {isAlreadySaved ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                  <span>Saved to Dashboard</span>
                                </>
                              ) : (
                                <>
                                  <Heart className="w-4 h-4 fill-current text-white animate-pulse" />
                                  <span>Save to Dashboard</span>
                                </>
                              )}
                            </button>
                          );
                        })()}
                        <button
                          onClick={() => downloadPdf(itinerary)}
                          className="px-4 py-2.5 sm:px-5 sm:py-3 bg-white hover:bg-slate-50 text-[#0F766E] font-bold rounded-2xl text-[11px] sm:text-xs tracking-wide shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-slate-100"
                        >
                          <Download className="w-4 h-4 text-[#FF6B35]" />
                          <span>Download PDF</span>
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all cursor-pointer border border-white/10 shrink-0"
                          title="Print Itinerary"
                        >
                          <Printer className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Day Selection Slider tabs */}
                  <div className="no-print flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-100">
                    <button
                      onClick={() => setActiveDay("all")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${activeDay === "all"
                        ? "bg-[#FF6B35] text-white shadow-md shadow-orange-500/10"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50"
                        }`}
                    >
                      All Days Flow
                    </button>
                    {itinerary.itinerary.map((dayItem) => (
                      <button
                        key={dayItem.day}
                        onClick={() => setActiveDay(dayItem.day)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${activeDay === dayItem.day
                          ? "bg-[#0F766E] text-white shadow-md shadow-emerald-700/10"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50"
                          }`}
                      >
                        Day {dayItem.day}
                      </button>
                    ))}
                  </div>

                  {/* Main Itinerary timeline cards display */}
                  <div className="print-grid grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column Timeline items */}
                    <div className="lg:col-span-8 space-y-6">
                      {itinerary.itinerary
                        .filter((dayItem) => activeDay === "all" || activeDay === dayItem.day)
                        .map((dayItem) => (
                          <div
                            key={dayItem.day}
                            className="print-card print-page-break relative bg-[#F8FAFC]/50 border border-slate-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs hover:border-emerald-100 hover:bg-white transition-all"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1.5 text-left">
                                <span className="text-[10px] font-bold text-[#FF6B35] uppercase tracking-wider font-mono bg-orange-50 px-2 py-0.5 rounded-md">
                                  {getDayCalendarDate(itinerary.startDate, dayItem.day) || `Day ${dayItem.day}`}
                                </span>
                                <h3 className="text-lg font-bold font-display text-slate-800">
                                  {dayItem.title}
                                </h3>
                              </div>
                              <div className="px-3 py-1 bg-emerald-50 text-[#0F766E] text-[10px] font-bold rounded-xl border border-emerald-100 flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                <span>{dayItem.estimatedCostRange || "Flexible Est."}</span>
                              </div>
                            </div>

                            {/* Attractions Map Pins list */}
                            <div className="space-y-2 text-left">
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#FF6B35]" />
                                Key Attractions visited
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {dayItem.attractions.map((att, idx) => (
                                  <span key={idx} className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs text-xs font-semibold text-slate-700 flex items-center gap-1">
                                    <span>📍</span> {att}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Sequential Activities checkboxes */}
                            <div className="space-y-3.5 text-left">
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Hour-by-hour Sequence flow
                              </h4>
                              <div className="space-y-2.5">
                                {dayItem.activities.map((act, idx) => {
                                  const actKey = `${dayItem.day}-${idx}`;
                                  const isDone = !!checkedActivities[actKey];
                                  return (
                                    <div
                                      key={idx}
                                      onClick={() => toggleActivity(dayItem.day, idx)}
                                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${isDone
                                        ? "bg-emerald-50/40 border-emerald-100 text-slate-500 line-through"
                                        : "bg-white border-slate-100 text-slate-800 hover:border-slate-200"
                                        }`}
                                    >
                                      <div className={`p-0.5 rounded-lg border-2 mt-0.5 ${isDone ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white text-transparent"
                                        }`}>
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      </div>
                                      <div className="space-y-0.5">
                                        <p className="text-xs font-semibold leading-relaxed">
                                          {act}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Food Suggestions Box */}
                            <div className="p-4 bg-orange-50/40 border border-orange-100/50 rounded-2xl text-left space-y-2">
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B35] flex items-center gap-1">
                                <Utensils className="w-3.5 h-3.5" />
                                Local Food Recommendations
                              </h4>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-medium text-slate-700">
                                {dayItem.foodRecommendations.map((food, idx) => (
                                  <li key={idx} className="flex items-center gap-1.5">
                                    <span className="text-sm">🍛</span>
                                    <span>{food}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                          </div>
                        ))}
                    </div>

                    {/* Right Column general Travel Tips & Insights */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className="print-card print-page-break bg-slate-50 border border-slate-100 rounded-3xl p-6 text-left space-y-5 shadow-sm">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60">
                          <Lightbulb className="w-5 h-5 text-[#FF6B35]" />
                          <h3 className="font-bold text-sm text-slate-800">
                            AI-Curated Travel Guidance
                          </h3>
                        </div>

                        <div className="space-y-4">
                          {(itinerary.travelTips || []).map((tip, idx) => (
                            <div key={idx} className="flex gap-3">
                              <div className="w-1.5 h-1.5 bg-[#0F766E] rounded-full shrink-0 mt-2" />
                              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                {tip}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl text-left">
                          <div className="flex gap-2 text-blue-800 font-bold text-xs mb-1">
                            <Info className="w-4 h-4 shrink-0" />
                            <h4>Incredible India Duty Tip</h4>
                          </div>
                          <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                            Always dress modestly at temples, keep hydrated with bottled water, and look out for local prepaid taxi stands.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </motion.div>
              ) : (
                // Default beautiful Kerala Escape simulated trip display when no search loaded
                <div className="bg-[#F8FAFC]/50 border border-slate-100 rounded-3xl p-6 md:p-10 text-center space-y-8 shadow-sm">

                  <div className="max-w-xl mx-auto space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35] bg-orange-50 px-3 py-1 rounded-full border border-orange-100 inline-block">
                      🌴 Sample Real-Time Preview
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 font-display">
                      Kerala Escape (5 Days)
                    </h3>
                    <p className="text-slate-500 text-xs md:text-sm">
                      This is a preview of a real-time journey structured beautifully. You can build your own customized version using the AI Planner above.
                    </p>
                  </div>

                  {/* Simulated Kerala Day steps with line down */}
                  <div className="relative max-w-lg mx-auto text-left pl-6 md:pl-8 space-y-8 border-l-2 border-dashed border-[#0F766E]/20">

                    {[
                      { day: 1, title: "Kochi Heritage Arrival", desc: "Explore Dutch Fort Kochi, Chinese Fishing Nets, and quiet Marine Drive evening." },
                      { day: 2, title: "Munnar Tea Hills Journey", desc: "Drive scenic winding roads to tea plantations & visit gorgeous Mattupetty Dam." },
                      { day: 3, title: "Thekkady Tiger Sanctuary", desc: "Take a tranquil boat cruise inside the Periyar Wildlife Sanctuary forest reserve." },
                      { day: 4, title: "Alleppey Houseboat Cruise", desc: "Check-in to a luxury bamboo houseboat floating along peaceful Vembanad backwaters." },
                      { day: 5, title: "Kochi Return & Shopping", desc: "Spice market souvenirs, hot Kerala parotta lunch, and airport transfer out." }
                    ].map((step) => (
                      <div key={step.day} className="relative">
                        {/* Floating glowing state ball */}
                        <span className="absolute -left-[35px] md:-left-[43px] top-0 w-6 h-6 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold text-[10px] shadow-md shadow-emerald-700/20">
                          {step.day}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#FF6B35]" />
                            <h4 className="font-bold text-sm text-slate-800">{step.title}</h4>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={scrollToForm}
                      className="px-6 py-3 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs rounded-2xl tracking-wide shadow-md cursor-pointer inline-flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Generate custom plan instead</span>
                    </button>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>
      )}

      {activeTab === "planner" && (
        <>
          {/* HOW YATRIK AI WORKS */}
          <section className="no-print py-16 bg-[#F8FAFC] border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35] bg-orange-50 px-3 py-1 rounded-full border border-orange-100 inline-block">
                  🤖 Step-by-Step Flow
                </span>
                <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[#0F172A]">
                  How Yatrik AI Works
                </h2>
                <p className="text-slate-500 text-xs md:text-sm">
                  We leverage advanced artificial intelligence trained specifically on Indian tourism, culture, cuisines, and logistics patterns.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { num: "01", title: "Tell us where", desc: "Type in any Indian destination or outline your interests." },
                  { num: "02", title: "AI Builds Itinerary", desc: "Our engine reviews local sights, dining hotspots, and routing." },
                  { num: "03", title: "Customize & Review", desc: "Check daily hours, attractions, local cuisines, and tips." },
                  { num: "04", title: "Download Offline PDF", desc: "Instantly export your plan as a beautiful document." }
                ].map((step, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 transition-all text-left space-y-3 shadow-xs">
                    <span className="text-3xl font-black font-display text-[#FF6B35]/20 block">
                      {step.num}
                    </span>
                    <h4 className="font-bold text-sm text-slate-800">{step.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TRAVEL STYLES GRID */}
          <section className="no-print py-16 bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block">
                  ✨ Personalized Themes
                </span>
                <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[#0F172A]">
                  Choose Your Travel Style
                </h2>
                <p className="text-slate-500 text-xs md:text-sm">
                  We fine-tune daily pacing, cost ratios, and activities to match exactly how you prefer to explore.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {TRAVEL_STYLES.map((style) => {
                  const StyleIcon = style.icon;
                  const isSel = formData.travelStyle === style.id;
                  return (
                    <div
                      key={style.id}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, travelStyle: style.id }));
                        scrollToForm();
                      }}
                      className={`p-6 rounded-3xl border cursor-pointer text-left space-y-4 transition-all ${isSel
                        ? "bg-[#0F766E]/5 border-[#0F766E] shadow-md"
                        : "bg-slate-50/50 hover:bg-white border-slate-100 hover:border-orange-100 hover:shadow-md"
                        }`}
                    >
                      <div className={`p-3 rounded-2xl w-fit ${isSel ? "bg-[#0F766E] text-white" : "bg-orange-50 text-[#FF6B35]"}`}>
                        <StyleIcon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-slate-800">{style.label}</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{style.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* LOCAL FOOD DISCOVERY (Interactive hover grid) */}
          <section className="no-print py-16 bg-[#F8FAFC] border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35] bg-orange-50 px-3 py-1 rounded-full border border-orange-100 inline-block">
                  🍲 Regional Culinary Highlights
                </span>
                <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[#0F172A]">
                  Discover Authentic Local Cuisines
                </h2>
                <p className="text-slate-500 text-xs md:text-sm">
                  Yatrik AI automatically suggests regional specialties to eat during your travels. Here are some legendary examples.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {REGIONAL_CUISINES.map((food, idx) => (
                  <div
                    key={idx}
                    className="group bg-white border border-slate-100 hover:border-orange-100 rounded-3xl shadow-2xs hover:shadow-md transition-all text-left overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-50">
                      <img
                        src={(food as any).img}
                        alt={food.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl text-lg font-bold text-slate-800 flex items-center gap-1 border border-slate-100 shadow-xs">
                        <span>{food.icon}</span>
                      </div>
                      <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md">
                        <span>{food.origin}</span>
                      </div>
                    </div>
                    <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-slate-800 group-hover:text-[#FF6B35] transition-colors">{food.name}</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          {food.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* BEST TIME TO VISIT SEASONAL TIMELINE */}
          <section className="no-print py-16 bg-white border-b border-slate-100">
            <div className="max-w-4xl mx-auto px-4 md:px-6">
              <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block">
                  ☀️ Interactive Seasonal Timeline
                </span>
                <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[#0F172A]">
                  Best Time to Visit India
                </h2>
                <p className="text-xs md:text-sm text-slate-500">
                  India has complex climates. Tap each season below to view targeted location suggestions.
                </p>
              </div>

              {/* Season Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl mb-8">
                {SEASONAL_TIMELINE.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSeason(idx)}
                    className={`py-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${activeSeason === idx
                      ? "bg-[#0F766E] text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-200/50"
                      }`}
                  >
                    {item.season}
                  </button>
                ))}
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                  <h4 className="font-bold text-slate-800 text-sm">
                    Recommended focus during: <span className="text-[#FF6B35]">{SEASONAL_TIMELINE[activeSeason].season}</span>
                  </h4>
                  <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-100">
                    {SEASONAL_TIMELINE[activeSeason].period}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Landscape Highlight</p>
                  <p className="text-xs font-bold text-[#0F766E] text-base">{SEASONAL_TIMELINE[activeSeason].focus}</p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Highly Recommended Cities</p>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/40">
                    {SEASONAL_TIMELINE[activeSeason].recommendations}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* STATISTICS PANEL */}
          <section className="no-print py-12 bg-gradient-to-r from-[#0F766E] to-[#0A524D] text-white">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { num: "5,000+", label: "Trips Planned" },
                  { num: "100+", label: "Indian Destinations" },
                  { num: "28", label: "States Covered" },
                  { num: "95%", label: "Satisfaction Rate" }
                ].map((stat, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-3xl md:text-4xl font-extrabold font-display text-white">
                      {stat.num}
                    </p>
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-emerald-100">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* USER REVIEWS (Stars cards) */}
          <section className="no-print py-16 bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block">
                  ⭐ Trusted Testimonials
                </span>
                <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[#0F172A]">
                  Loved by Global Travelers
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {REVIEWS.map((rev, idx) => (
                  <div
                    key={idx}
                    className="bg-[#F8FAFC]/50 border border-slate-100 p-6 rounded-3xl text-left space-y-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-500 stroke-none" />
                        ))}
                      </div>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium italic">
                        "{rev.quote}"
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-800">{rev.name}</span>
                      <span className="text-slate-400 font-normal">{rev.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FINAL CALL TO ACTION (CTA) */}
          <section className="no-print py-16 md:py-24 bg-white relative overflow-hidden">
            {/* Dynamic backdrop glows */}
            <div className="absolute inset-0 bg-[#F8FAFC] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-100 blur-3xl opacity-50 rounded-full" />

            <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10 text-center space-y-6 md:space-y-8">
              <div className="p-3.5 bg-orange-50 text-[#FF6B35] rounded-3xl w-fit mx-auto shadow-md">
                <Compass className="w-8 h-8 animate-spin-slow" />
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display tracking-tight text-[#0F172A]">
                  Ready to Explore Incredible India?
                </h2>
                <p className="text-[#0F766E] text-base font-bold">
                  One custom prompt is all it takes to build a masterpiece.
                </p>
              </div>

              <button
                onClick={scrollToForm}
                className="px-8 py-4 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-2xl tracking-wide shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer inline-flex items-center gap-2 group"
              >
                <span>🧡 Start Planning Your Indian Escape</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>
        </>
      )}

      {/* FOOTER */}
      <footer className="no-print bg-slate-900 text-slate-400 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-slate-800 pb-8 mb-8 text-left">
            <div className="space-y-2">
              <h3 className="text-white text-lg font-bold font-display flex items-center gap-1.5">
                Yatrik <span className="text-[#FF6B35]">AI</span>
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                A gorgeous next-generation travel companion that generates complete day-wise itineraries across India using custom Google Gemini engines.
              </p>
            </div>
            <div className="flex flex-col md:items-end gap-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Follow our adventures</p>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/the_darkhacker010"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-[#FF6B35] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs cursor-pointer"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4.5 h-4.5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-[#FF6B35] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs cursor-pointer"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4.5 h-4.5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-[#FF6B35] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs cursor-pointer"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4.5 h-4.5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/sunil2004/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-[#FF6B35] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs cursor-pointer"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4.5 h-4.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-[11px] text-slate-600">
            <p>© 2026 Yatrik AI Inc. All rights reserved. Built with love in Incredible India.</p>
            <div className="flex gap-4">
              <button onClick={scrollToForm} className="hover:underline cursor-pointer">Planner</button>
              <button onClick={scrollToPopular} className="hover:underline cursor-pointer">Destinations</button>
            </div>
          </div>
        </div>
      </footer>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-xs font-bold border max-w-sm ${toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
          >
            {toast.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : toast.type === "error" ? (
              <HelpCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <Compass className="w-4 h-4 text-blue-600 shrink-0 animate-spin-slow" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setAuthModalOpen(false);
                setForgotPasswordMode(false);
              }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-8 max-h-[90vh] overflow-y-auto z-10 text-left"
            >
              <button
                onClick={() => {
                  setAuthModalOpen(false);
                  setForgotPasswordMode(false);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all cursor-pointer border-none"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div className="text-center space-y-1.5">
                  <div className="inline-flex p-3 bg-orange-50 text-[#FF6B35] rounded-2xl">
                    {forgotPasswordMode ? (
                      <Key className="w-6 h-6" />
                    ) : authMode === "signin" ? (
                      <LogIn className="w-6 h-6" />
                    ) : (
                      <UserPlus className="w-6 h-6" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-850">
                    {forgotPasswordMode
                      ? "Reset Password"
                      : authMode === "signin"
                        ? "Welcome Back"
                        : "Create Yatrik Account"}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {forgotPasswordMode
                      ? "Enter your email to receive a password recovery link."
                      : authMode === "signin"
                        ? "Sign in to access your cloud-backed travel escapes."
                        : "Create a free account to instantly backup your custom itineraries."}
                  </p>
                </div>

                {authError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 font-semibold">
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={authMode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
                  {authMode === "signup" && !forgotPasswordMode && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Sunil Power"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-hidden focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-hidden focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all"
                    />
                  </div>

                  {!forgotPasswordMode && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-hidden focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all"
                      />
                    </div>
                  )}

                  {authMode === "signup" && !forgotPasswordMode && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={authConfirmPassword}
                        onChange={(e) => setAuthConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-hidden focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all"
                      />
                    </div>
                  )}

                  {authMode === "signin" && !forgotPasswordMode && (
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 select-none">
                        <input
                          type="checkbox"
                          checked={authRememberMe}
                          onChange={(e) => setAuthRememberMe(e.target.checked)}
                          className="rounded-sm border-slate-300 text-[#0F766E] focus:ring-[#0F766E] accent-teal-600 cursor-pointer"
                        />
                        <span>Remember Me</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordMode(true);
                          setAuthError(null);
                        }}
                        className="text-xs font-bold text-[#0F766E] hover:text-[#FF6B35] transition-colors border-none bg-transparent cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-[#FF6B35] hover:bg-orange-600 disabled:bg-slate-400 text-white font-bold rounded-xl text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none"
                  >
                    {authLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : forgotPasswordMode ? (
                      <>
                        <Key className="w-3.5 h-3.5" />
                        <span>Send Reset Link</span>
                      </>
                    ) : authMode === "signin" ? (
                      <>
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Third-Party Authentication Divider */}
                {!forgotPasswordMode && (
                  <div className="space-y-4">
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-100"></div>
                      <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Or Continue With
                      </span>
                      <div className="flex-grow border-t border-slate-100"></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={authLoading}
                      className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.12C18.28 1.845 15.543 1 12.24 1 5.922 1 12.24 1 12.24 12.24s4.922 11.24 11.24 11.24c6.6 0 11-4.64 11-11.24 0-.76-.08-1.34-.18-1.955H12.24z"
                        />
                      </svg>
                      <span>Google Account</span>
                    </button>
                  </div>
                )}

                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      if (forgotPasswordMode) {
                        setForgotPasswordMode(false);
                      } else {
                        setAuthMode(authMode === "signin" ? "signup" : "signin");
                      }
                      setAuthError(null);
                    }}
                    className="text-xs text-[#0F766E] hover:text-[#FF6B35] hover:underline cursor-pointer font-bold border-none bg-transparent"
                  >
                    {forgotPasswordMode
                      ? "Back to login screen"
                      : authMode === "signin"
                        ? "New to Yatrik AI? Create an account instead"
                        : "Already have an account? Sign in instead"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WATCH DEMO MODAL */}
      <AnimatePresence>
        {demoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDemoModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-850 p-6 max-h-[90vh] overflow-y-auto z-10"
            >
              <button
                onClick={() => setDemoModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6 text-left">
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-md font-bold">
                    Interactive Live Simulator
                  </span>
                  <h3 className="text-lg font-bold font-display text-white">
                    Simulated Yatrik AI Generation
                  </h3>
                </div>

                {/* Simulated live console terminal window */}
                <div className="bg-black/80 rounded-2xl border border-slate-800 p-4 font-mono text-xs space-y-4 min-h-[190px]">

                  {/* Step 0: Typing prompt */}
                  {demoStep >= 0 && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400">
                      <span className="text-orange-500">&gt;</span> query: "Plan a 5-day honeymoon in Kerala under ₹25,000"
                    </motion.p>
                  )}

                  {/* Step 1: Processing model triggers */}
                  {demoStep >= 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1 text-slate-300">
                      <p className="text-[#0F766E] font-bold">● CONTACTING GEMINI 3.5 COGNITIVE ENGINE...</p>
                      <p className="text-slate-500">→ [success] initialized travelStyle: 'Honeymoon'</p>
                      <p className="text-slate-500">→ [success] resolved budget: 'Budget Range'</p>
                    </motion.div>
                  )}

                  {/* Step 2: Mapping routes */}
                  {demoStep >= 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1 text-slate-300">
                      <p className="text-[#2563EB] font-bold">● PACKAGING INCREDIBLE INDIA ROUTE LOGISTICS...</p>
                      <p className="text-slate-500">→ Connected: Kochi Airport → Munnar Valley → Alleppey Backwaters</p>
                    </motion.div>
                  )}

                  {/* Step 3: Success preview */}
                  {demoStep >= 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-300 space-y-1">
                      <p className="font-bold">✨ INCREDIBLE KERALA RETREAT GENERATED SUCCESSFULLY!</p>
                      <p className="text-[11px] text-slate-400">5-Day custom honeymoon, with daily spice-boat, candlelight houseboat dinners, and offline PDF ready.</p>
                    </motion.div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs">
                  <p className="text-slate-500 font-bold">Simulated Experience</p>
                  <button
                    onClick={() => {
                      setFormData({
                        destination: "Kerala",
                        days: 5,
                        budget: "Mid-range",
                        travelers: 2,
                        travelStyle: "Honeymoon",
                        startDate: getTodayString(),
                        endDate: addDaysToDateStr(getTodayString(), 5)
                      });
                      setPromptQuery("Plan a 5-day honeymoon in Kerala");
                      setDemoModalOpen(false);
                      scrollToForm();
                    }}
                    className="px-4 py-2 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Load in Planner
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Yatrik AI Floating Chatbot */}
      <div className="no-print fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl shadow-2xl w-[calc(100vw-32px)] sm:w-[360px] md:w-[400px] h-[460px] sm:h-[520px] md:h-[600px] flex flex-col overflow-hidden mb-3 sm:mb-4 max-w-lg"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0F766E] to-[#FF6B35] p-3 sm:p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center text-lg sm:text-xl shadow-inner border border-white/20">
                      🧭
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-[11px] sm:text-xs font-black tracking-wider uppercase">Yatrik AI Assistant</h3>
                    <p className="text-[9px] sm:text-[10px] text-white/80 font-medium">Your Intelligent Travel Companion</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4 bg-slate-50/50">
                {/* Intro Card */}
                <div className="p-3 sm:p-4 bg-orange-50/40 border border-orange-100 rounded-2xl text-left space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#FF6B35] font-bold text-[11px] sm:text-xs">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Intelligent Companion Guide</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 leading-relaxed font-medium">
                    Yatrik AI Assistant is your intelligent travel companion that helps you plan personalized trips across India. Simply describe your travel preferences, and it creates customized itineraries, suggests destinations, recommends hotels and local attractions, optimizes your budget, and lets you download your complete travel plan.
                  </p>
                </div>

                {/* Message list */}
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 sm:p-3.5 rounded-2xl text-[11px] sm:text-xs font-medium leading-relaxed text-left ${msg.role === "user"
                        ? "bg-[#FF6B35] text-white rounded-br-none shadow-md shadow-orange-500/10"
                        : "bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-xs whitespace-pre-line"
                        }`}
                    >
                      {msg.content}
                      {/* Special Integrated buttons for travel generation */}
                      {msg.role === "assistant" && idx > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              scrollToForm();
                            }}
                            className="px-2.5 py-1 bg-orange-50 hover:bg-[#FF6B35] text-[#FF6B35] hover:text-white border border-[#FF6B35]/20 rounded-lg text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer"
                          >
                            📍 Load in Planner
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleSendChatMessage(undefined, "Can you suggest some famous local hotels and attractions for this trip?");
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-[#0F766E] text-[#0F766E] hover:text-white border border-[#0F766E]/20 rounded-lg text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer"
                          >
                            🏨 Hotels & Attractions
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 p-3 sm:p-3.5 rounded-2xl rounded-bl-none shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Form Input Footer */}
              <form onSubmit={handleSendChatMessage} className="p-2 sm:p-3 bg-white border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Describe your travel preferences..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-[11px] sm:text-xs font-medium focus:outline-hidden focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FF6B35] hover:bg-orange-600 disabled:bg-slate-100 disabled:text-slate-400 text-white flex items-center justify-center transition-all shadow-md shadow-orange-500/10 shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Trigger Pill Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-gradient-to-r from-[#0F766E] to-[#FF6B35] text-white p-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-orange-500/20 transition-all flex items-center gap-2 sm:gap-2.5 group cursor-pointer border border-white/15 animate-bounce min-w-[44px] min-h-[44px] justify-center"
          style={{ animationDuration: "3s" }}
        >
          <div className="relative flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
            <span className="absolute top-[-3px] right-[-3px] w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide hidden sm:inline">Yatrik AI Assistant</span>
        </motion.button>
      </div>
    </div>
  );
}
