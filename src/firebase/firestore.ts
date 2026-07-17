import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  serverTimestamp,
  writeBatch,
  increment
} from "firebase/firestore";
import { db, auth } from "./config";
import { handleFirestoreError, OperationType } from "./error";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  provider: string;
  emailVerified: boolean;
  createdAt: any;
  lastLogin: any;
  subscriptionPlan: string;
  tripCount: number;
}

export interface TripPlan {
  tripId: string;
  destination: string;
  startingLocation: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  budget: string;
  travelers: string;
  travelStyle: string;
  interests: string[];
  generatedItinerary: any;
  hotelRecommendations?: any[];
  transportRecommendations?: any[];
  estimatedBudget?: any;
  weatherInformation?: any;
  packingChecklist?: string[];
  tripStatus: "upcoming" | "ongoing" | "past";
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Creates or merges a user profile document in Firestore
 */
export async function createUserProfile(
  uid: string,
  name: string,
  email: string,
  photoURL: string = "",
  provider: string = "password"
): Promise<UserProfile> {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);

    const emailVerified = auth.currentUser?.emailVerified || false;

    if (!docSnap.exists()) {
      const newUser: UserProfile = {
        uid,
        name: name || "Traveler",
        email: email || "",
        photoURL: photoURL || "",
        provider,
        emailVerified,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        subscriptionPlan: "free",
        tripCount: 0,
      };
      await setDoc(userRef, newUser);
      return { ...newUser, createdAt: new Date(), lastLogin: new Date() };
    } else {
      // If profile already exists, update lastLogin
      const updates = {
        lastLogin: serverTimestamp(),
        emailVerified,
      };
      await updateDoc(userRef, updates);
      return { ...docSnap.data(), ...updates } as UserProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieves a user's profile
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Saves a generated travel plan to Firestore under user subcollection,
 * and increments their trip count atomically.
 */
export async function saveTrip(userId: string, trip: Omit<TripPlan, "createdAt" | "updatedAt">): Promise<void> {
  const path = `users/${userId}/trips/${trip.tripId}`;
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const emailVerified = auth.currentUser?.emailVerified || false;
      const provider = auth.currentUser?.providerData[0]?.providerId || "password";
      const newUser: UserProfile = {
        uid: userId,
        name: auth.currentUser?.displayName || "Traveler",
        email: auth.currentUser?.email || "",
        photoURL: auth.currentUser?.photoURL || "",
        provider,
        emailVerified,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        subscriptionPlan: "free",
        tripCount: 0,
      };
      await setDoc(userRef, newUser);
    }

    // Save the trip document first
    const tripRef = doc(db, "users", userId, "trips", trip.tripId);
    await setDoc(tripRef, {
      ...trip,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });


    // Increment user trip count

    await updateDoc(userRef, {
      tripCount: increment(1)
    });

  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieves all saved trips for a user
 */
export async function getUserTrips(userId: string): Promise<TripPlan[]> {
  const path = `users/${userId}/trips`;
  try {
    const tripsCol = collection(db, "users", userId, "trips");
    const querySnapshot = await getDocs(tripsCol);
    const trips: TripPlan[] = [];
    querySnapshot.forEach((doc) => {
      trips.push(doc.data() as TripPlan);
    });
    return trips;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Updates an existing trip plan
 */
export async function updateTrip(userId: string, tripId: string, updates: Partial<TripPlan>): Promise<void> {
  const path = `users/${userId}/trips/${tripId}`;
  try {
    const tripRef = doc(db, "users", userId, "trips", tripId);
    await updateDoc(tripRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Deletes a trip plan and decrements their trip count atomically
 */
export async function deleteTrip(userId: string, tripId: string): Promise<void> {
  const path = `users/${userId}/trips/${tripId}`;
  try {
    const batch = writeBatch(db);

    // Delete the trip document
    const tripRef = doc(db, "users", userId, "trips", tripId);
    batch.delete(tripRef);

    // Decrement user trip count safely
    const userRef = doc(db, "users", userId);
    batch.update(userRef, {
      tripCount: increment(-1)
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Duplicates a trip plan with a new unique ID and increments the trip count
 */
export async function duplicateTrip(userId: string, originalTrip: TripPlan): Promise<string> {
  const newTripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const path = `users/${userId}/trips/${newTripId}`;
  try {
    const batch = writeBatch(db);
    const tripRef = doc(db, "users", userId, "trips", newTripId);

    const duplicatedTrip: TripPlan = {
      ...originalTrip,
      tripId: newTripId,
      destination: `${originalTrip.destination} (Copy)`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    batch.set(tripRef, duplicatedTrip);

    const userRef = doc(db, "users", userId);
    batch.update(userRef, {
      tripCount: increment(1)
    });

    await batch.commit();
    return newTripId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
