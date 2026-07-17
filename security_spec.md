# Security Specification - YatrikAI Firebase Security

## 1. Data Invariants

### User Profile Invariants
1. **Access Bound**: A user profile located at `/users/{uid}` can only be read or written by the authenticated user whose `request.auth.uid` matches `{uid}`. There are no public or cross-user reads of profiles.
2. **Identity Sync**: The `uid` in the document body must exactly match `request.auth.uid`.
3. **Email Verification Guard**: Write operations (create, update) are only allowed if `request.auth.token.email_verified == true` (for verified email accounts) and the document's `email` matches `request.auth.token.email`.
4. **Immutability**: Once created, `uid`, `email`, `provider`, and `createdAt` are immutable and cannot be updated.
5. **Role/Plan Control**: Users cannot self-escalate or change their `subscriptionPlan` directly. Only specialized operations (or admin actions) can write these, and standard client updates are blocked via `affectedKeys()`.

### Saved Trip Invariants
1. **Ownership**: A trip document located at `/users/{uid}/trips/{tripId}` belongs entirely to `{uid}`. Only the authenticated user whose `request.auth.uid == uid` can read or write (create, update, delete) to this subcollection.
2. **ID Poisoning Guard**: The document ID `{tripId}` must be a valid string conforming to `isValidId()` (size <= 128, alphanumeric + underscores/dashes), and the document body's `tripId` must match `{tripId}` exactly.
3. **Temporal Integrity**:
   - On `create`, `createdAt` and `updatedAt` must be strictly set to the server timestamp `request.time`.
   - On `update`, `updatedAt` must be set to `request.time`, and `createdAt` must remain unchanged (`incoming().createdAt == existing().createdAt`).
4. **Data Validation**:
   - `numberOfDays` must be an integer, greater than 0, and less than or equal to 30.
   - `destination` must be a non-empty string under 100 characters.

---

## 2. The "Dirty Dozen" Payloads (Exploit Vector Specs)

Below are the 12 JSON payloads designed to break YatrikAI's data and security invariants. Each of these must be rejected with `PERMISSION_DENIED` by the Firestore rules engine.

### Payload 1: Unauthenticated User Profile Creation
*   **Path**: `/users/attackerUid123`
*   **Operation**: `create`
*   **Context**: `request.auth == null`
*   **Attack Vector**: An anonymous/unauthenticated client attempts to register a profile.
*   **Payload**:
    ```json
    {
      "uid": "attackerUid123",
      "name": "Malicious User",
      "email": "attacker@spam.com",
      "provider": "password",
      "createdAt": "2026-07-16T00:00:00Z",
      "lastLogin": "2026-07-16T00:00:00Z"
    }
    ```

### Payload 2: Cross-User Profile Spoofing
*   **Path**: `/users/victimUid456`
*   **Operation**: `create`
*   **Context**: `request.auth.uid == "attackerUid123"`
*   **Attack Vector**: Authenticated User A tries to hijack or create the profile for User B.
*   **Payload**:
    ```json
    {
      "uid": "victimUid456",
      "name": "Victim User",
      "email": "victim@gmail.com",
      "provider": "google.com",
      "createdAt": "2026-07-16T00:00:00Z",
      "lastLogin": "2026-07-16T00:00:00Z"
    }
    ```

### Payload 3: Direct Subscription Plan Self-Escalation
*   **Path**: `/users/attackerUid123`
*   **Operation**: `update`
*   **Context**: `request.auth.uid == "attackerUid123"`
*   **Attack Vector**: User attempts to update their subscription plan to "premium" or "enterprise" without paying, bypassing backend auth.
*   **Payload**:
    ```json
    {
      "subscriptionPlan": "premium",
      "lastLogin": "2026-07-16T01:00:00Z"
    }
    ```

### Payload 4: Trip ID Spoofing / Value Poisoning
*   **Path**: `/users/attackerUid123/trips/tripA`
*   **Operation**: `create`
*   **Context**: `request.auth.uid == "attackerUid123"`
*   **Attack Vector**: Placing a trip under ID `tripA` but putting `tripId` as `tripB` inside the document to create orphaned lookups or cache invalidations.
*   **Payload**:
    ```json
    {
      "tripId": "tripB",
      "destination": "Goa",
      "numberOfDays": 5,
      "generatedItinerary": {},
      "createdAt": "request.time",
      "updatedAt": "request.time"
    }
    ```

### Payload 5: ID Poisoning (Extremely Long / Junk ID Injection)
*   **Path**: `/users/attackerUid123/trips/junk-id-$$$-with-huge-whitespace-and-malicious-characters-10000-chars`
*   **Operation**: `create`
*   **Context**: `request.auth.uid == "attackerUid123"`
*   **Attack Vector**: Attempting to inject high-byte characters or giant strings as document IDs to pollute indexes or trigger client overflows.
*   **Payload**:
    ```json
    {
      "tripId": "junk-id-$$$-with-huge-whitespace-and-malicious-characters-10000-chars",
      "destination": "Jaipur",
      "numberOfDays": 3,
      "generatedItinerary": {},
      "createdAt": "request.time",
      "updatedAt": "request.time"
    }
    ```

### Payload 6: Cross-User Trip Theft (Read)
*   **Path**: `/users/victimUid456/trips/tripV`
*   **Operation**: `get` / `list`
*   **Context**: `request.auth.uid == "attackerUid123"`
*   **Attack Vector**: User A attempts to scrape or download User B's vacation plans.
*   **Payload**: N/A (Read Attempt)

### Payload 7: Cross-User Trip Sabotage (Write/Delete)
*   **Path**: `/users/victimUid456/trips/tripV`
*   **Operation**: `create` / `update` / `delete`
*   **Context**: `request.auth.uid == "attackerUid123"`
*   **Attack Vector**: User A attempts to inject or delete trips in User B's folder.
*   **Payload**:
    ```json
    {
      "tripId": "tripV",
      "destination": "Hijacked Goa",
      "numberOfDays": 10,
      "generatedItinerary": {},
      "createdAt": "request.time",
      "updatedAt": "request.time"
    }
    ```

### Payload 8: Value Poisoning (Invalid Integer Range)
*   **Path**: `/users/attackerUid123/trips/tripA`
*   **Operation**: `create`
*   **Context**: `request.auth.uid == "attackerUid123"`
*   **Attack Vector**: Bypassing UI limitations to generate a trip for `-5` days, or `500` days, overloading resources.
*   **Payload**:
    ```json
    {
      "tripId": "tripA",
      "destination": "Varanasi",
      "numberOfDays": -5,
      "generatedItinerary": {},
      "createdAt": "request.time",
      "updatedAt": "request.time"
    }
    ```

### Payload 9: Spoofed Temporal Timestamps
*   **Path**: `/users/attackerUid123/trips/tripA`
*   **Operation**: `create`
*   **Context**: `request.auth.uid == "attackerUid123"`
*   **Attack Vector**: Forging client-side creation timestamps to skew history.
*   **Payload**:
    ```json
    {
      "tripId": "tripA",
      "destination": "Manali",
      "numberOfDays": 4,
      "generatedItinerary": {},
      "createdAt": "2020-01-01T00:00:00Z",
      "updatedAt": "2020-01-01T00:00:00Z"
    }
    ```

### Payload 10: Immutable Property Violation on Update
*   **Path**: `/users/attackerUid123/trips/tripA`
*   **Operation**: `update`
*   **Context**: `request.auth.uid == "attackerUid123"`
*   **Attack Vector**: User attempts to update `createdAt` or change the `tripId` key in a document that has already been created.
*   **Payload**:
    ```json
    {
      "tripId": "newTripIdWhichIsIllegal",
      "createdAt": "2020-01-01T00:00:00Z",
      "updatedAt": "request.time"
    }
    ```

### Payload 11: Profile Email Spoofing
*   **Path**: `/users/attackerUid123`
*   **Operation**: `create`
*   **Context**: `request.auth.uid == "attackerUid123"`, but `request.auth.token.email == "attacker@real.com"`
*   **Attack Vector**: Registering a profile with an email address (`victim@gmail.com`) different from the verified email linked to the firebase auth token.
*   **Payload**:
    ```json
    {
      "uid": "attackerUid123",
      "name": "Attacker",
      "email": "victim@gmail.com",
      "provider": "google.com",
      "createdAt": "request.time",
      "lastLogin": "request.time"
    }
    ```

### Payload 12: Terminal State Locking Bypass
*   **Path**: `/users/attackerUid123/trips/tripA`
*   **Operation**: `update`
*   **Context**: `request.auth.uid == "attackerUid123"`
*   **Attack Vector**: Modifying a finished trip (status: `past`) to change basic variables when updates should be blocked.
*   **Payload**:
    ```json
    {
      "destination": "Illegal Destination Change",
      "updatedAt": "request.time"
    }
    ```

---

## 3. Test Runner Design (`firestore.rules.test.ts`)

A automated local emulator test file would look as follows:

```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

describe("YatrikAI Security Rules", () => {
  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "yatrikai-test-project",
      firestore: {
        rules: require("fs").readFileSync("firestore.rules", "utf8"),
      },
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  it("should fail Payload 1: Unauthenticated profile creation", async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthDb, "users/attackerUid123");
    await assertFails(setDoc(docRef, {
      uid: "attackerUid123",
      name: "Malicious User",
      email: "attacker@spam.com",
      provider: "password",
      createdAt: new Date(),
      lastLogin: new Date()
    }));
  });

  it("should fail Payload 2: Cross-user profile spoofing", async () => {
    const authDb = testEnv.authenticatedContext("attackerUid123", { email: "attacker@real.com", email_verified: true }).firestore();
    const docRef = doc(authDb, "users/victimUid456");
    await assertFails(setDoc(docRef, {
      uid: "victimUid456",
      name: "Victim User",
      email: "victim@gmail.com",
      provider: "google.com",
      createdAt: new Date(),
      lastLogin: new Date()
    }));
  });

  it("should fail Payload 3: Direct subscription plan self-escalation", async () => {
    const authDb = testEnv.authenticatedContext("attackerUid123", { email: "attacker@real.com", email_verified: true }).firestore();
    const docRef = doc(authDb, "users/attackerUid123");
    
    // Create base valid profile first
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "users/attackerUid123"), {
        uid: "attackerUid123",
        name: "Attacker",
        email: "attacker@real.com",
        provider: "google.com",
        subscriptionPlan: "free",
        createdAt: new Date(),
        lastLogin: new Date()
      });
    });

    await assertFails(updateDoc(docRef, {
      subscriptionPlan: "premium"
    }));
  });
});
```
