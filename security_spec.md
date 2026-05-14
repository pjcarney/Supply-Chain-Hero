# Security Specification - SupplyChain Hero

## Data Invariants
1. A user can only read and write their own progress document.
2. The `userId` field in the document must match the authenticated user's UID.
3. Scores must be a map where values are positive integers (representing days).
4. `lastUpdated` must be the server timestamp.

## The "Dirty Dozen" Payloads (Deny Cases)
1. **Identity Spoofing**: Attempt to write to `/users/anotherUser123` while logged in as `me`.
2. **Field Injection**: Attempt to add a `cheater: true` field to the user profile.
3. **Invalid Data Type**: Send `scores: { "1": "very fast" }` (string instead of number).
4. **Negative Days**: Send `scores: { "1": -5 }`.
5. **Timestamp Trick**: Send a manual `lastUpdated` timestamp from the past.
6. **Anonymous Access**: Attempt to read any user profile without logging in.
7. **Bulk Read**: Attempt to list all users in `/users`.
8. **Malicious ID**: Attempt to create a user with ID `../../etc/passwd`.
9. **Resource Exhaustion**: Send a 1MB string in a scenario key.
10. **Modification of userId**: Update an existing document and change the `userId` field.
11. **Unverified Email (if applicable)**: Accessing data before verifying email (if we enforce verification).
12. **Shadow Update**: Adding unexpected fields during an update to `scores`.

## Verification Plan
We will use rules to enforce:
- `request.auth.uid == userId`
- `isValidUserProgress(incoming())`
- `affectedKeys().hasOnly(['scores', 'lastUpdated'])` for updates.
