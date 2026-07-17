import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User
} from "firebase/auth";
import { auth } from "./config";
import { createUserProfile } from "./firestore";

const googleProvider = new GoogleAuthProvider();

/**
 * Signs up a new user with Email and Password, and initializes their profile.
 */
export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
): Promise<User> {
  // Enforce password size constraint
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  // Create the Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Initialize the user profile in Firestore
  await createUserProfile(user.uid, name, email, "", "password");

  // Send verification email in the background without blocking active login
  try {
    await sendEmailVerification(user);
  } catch (e) {
    console.warn("Verification email skip or limit reached:", e);
  }

  return user;
}

/**
 * Log in using email and password with customized persistence (Remember Me)
 */
export async function loginWithEmail(
  email: string,
  password: string,
  rememberMe: boolean
): Promise<User> {
  const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistence);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Ensure Firestore user profile is synchronised
    await createUserProfile(user.uid, user.displayName || "", user.email || "", user.photoURL || "", "password");

    return user;
  } catch (err: any) {
    if (err.code === "auth/user-not-found") {
      throw new Error("Account not found. Please create an account.");
    }
    if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
      try {
        // Try creating the user to check if the email is registered
        const tempCred = await createUserWithEmailAndPassword(auth, email, password);
        // If it succeeds, the user did not exist! We delete it immediately and prompt the user.
        await tempCred.user.delete();
        throw new Error("Account not found. Please create an account.");
      } catch (signUpErr: any) {
        if (signUpErr.code === "auth/email-already-in-use") {
          throw new Error("Incorrect password. Please try again.");
        }
        throw err;
      }
    }
    throw err;
  }
}

/**
 * Initiates Google Sign-In flow
 */
export async function loginWithGoogle(): Promise<User> {
  await setPersistence(auth, browserLocalPersistence);
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Sync profile to Firestore
  await createUserProfile(
    user.uid,
    user.displayName || "Traveler",
    user.email || "",
    user.photoURL || "",
    "google.com"
  );

  return user;
}

/**
 * Triggers standard Firebase password reset email
 */
export async function triggerPasswordReset(email: string): Promise<void> {
  if (!email) throw new Error("Email address is required.");
  await sendPasswordResetEmail(auth, email);
}

/**
 * Signs out active user session
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
