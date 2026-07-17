export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  attractions: string[];
  foodRecommendations: string[];
  estimatedCostRange: string;
}

export interface TravelItinerary {
  tripTitle: string;
  destination: string;
  durationDays: number;
  budget: string;
  travelers: number;
  travelStyle: string;
  startDate?: string;
  endDate?: string;
  itinerary: ItineraryDay[];
  travelTips: string[];
}

export interface SavedTrip {
  id: string;
  timestamp: number;
  userId?: string;
  data: TravelItinerary;
}

export interface FormInputs {
  destination: string;
  days: number;
  budget: "Budget" | "Mid-range" | "Luxury";
  travelers: number;
  travelStyle: string;
  startDate: string;
  endDate: string;
}
