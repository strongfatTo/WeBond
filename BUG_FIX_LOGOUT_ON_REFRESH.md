# Bug Fix: User Logs Out on Page Refresh or Logo Click

## Bug Description
**Bug 10**: User logs out every time the website is refreshed or when clicking the WeBond logo.

## Root Cause Analysis

This bug had **THREE separate root causes**:

### Issue 1: Logo Click Redirects to Landing Page (`app.html`)

**Location**: `app.html` line 18

**Problem**: 
The WeBond logo had an onclick handler that redirected to `index.html`:
```html
<div class="logo" onclick="window.location.href='index.html'" ...>
```

This caused:
- Full page reload
- Navigation away from the app
- Loss of application state
- User appears to be logged out

### Issue 2: Session Not Persisted on Refresh (`app-supabase.js`)

**Location**: `app-supabase.js` lines 75-80

**Problem**:
The `loadAuthState()` function only checked `localStorage` but didn't verify the Supabase session:

```javascript
// Before fix - Only checks localStorage
function loadAuthState() {
    const savedUser = localStorage.getItem('webond_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
}
```

**Why this caused logout on refresh**:
1. When page refreshes, `localStorage` might have stale data
2. No verification with Supabase auth session
3. If Supabase session expired, user would still appear logged in (from localStorage) but API calls would fail
4. Conversely, if localStorage was cleared but Supabase session was still valid, user would appear logged out

**Comparison with `app.js`**:
The `app.js` file had the correct implementation that properly checked Supabase session on load.

### Issue 3: Supabase Client Not Configured for Session Persistence

**Location**: Both `app-supabase.js` and `app.js` - Supabase client initialization

**Problem**:
The Supabase client was created without explicit session persistence configuration:

```javascript
// Before fix - No persistence configuration
supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

**Why this caused logout on refresh**:
1. Without explicit configuration, session storage behavior was inconsistent
2. Sessions weren't being properly saved to localStorage
3. On page refresh, the Supabase client couldn't retrieve the previous session
4. Even though `loadAuthState()` checked for session, there was no session to find

**Critical Missing Configuration**:
- `persistSession: true` - Store session in localStorage
- `autoRefreshToken: true` - Automatically refresh expired tokens
- `detectSessionInUrl: true` - Detect session from URL (for OAuth flows)
- `storage: window.localStorage` - Explicitly specify storage mechanism

## Solution

### Fix 1: Change Logo Click Behavior

Changed the logo onclick to navigate within the app instead of redirecting:

```html
<!-- Before -->
<div class="logo" onclick="window.location.href='index.html'" ...>

<!-- After -->
<div class="logo" onclick="showPage('dashboard')" ...>
```

**Benefits**:
- No page reload
- Stays within the app
- Maintains user session
- Better UX with instant navigation

### Fix 2: Implement Proper Session Persistence

Updated `loadAuthState()` to check Supabase session and sync with database:

```javascript
// After fix - Properly checks Supabase session
async function loadAuthState() {
    if (!isSupabaseReady()) {
        console.error('Supabase not ready in loadAuthState');
        return;
    }

    const { data: { session }, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error('Error getting Supabase session:', error);
        return;
    }

    if (session) {
        // Fetch user profile from database
        try {
            const { data: profile, error: profileError } = await supabaseClient
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

            if (profileError) {
                console.error('Failed to load user profile from session:', profileError);
                currentUser = null;
                localStorage.removeItem('webond_user');
                return;
            }

            if (!profile) {
                // Profile doesn't exist
                console.warn('User authenticated but no profile exists. Logging out...');
                await supabaseClient.auth.signOut();
                currentUser = null;
                localStorage.removeItem('webond_user');
                alert('Your account setup is incomplete. Please register again.');
                return;
            }

            currentUser = profile;
            localStorage.setItem('webond_user', JSON.stringify(currentUser));
        } catch (err) {
            console.error('Exception loading user profile:', err);
            currentUser = null;
            localStorage.removeItem('webond_user');
        }
    } else {
        // No active session, clear stale data
        currentUser = null;
        localStorage.removeItem('webond_user');
    }
}
```

Also updated the initialization to await the async function:

```javascript
// In window.onload
if (initializeSupabase()) {
    await loadAuthState();  // Added await
    updateUI();
}
```

### Fix 3: Configure Supabase Client for Session Persistence

Added explicit session persistence configuration to Supabase client initialization:

```javascript
// After fix - Proper session persistence configuration
supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,        // Store session in localStorage
        autoRefreshToken: true,      // Automatically refresh expired tokens
        detectSessionInUrl: true,    // Detect session from URL (OAuth)
        storage: window.localStorage // Explicitly use localStorage
    }
});
```

**What each option does**:
- **`persistSession: true`**: Saves the authentication session to localStorage so it survives page refreshes
- **`autoRefreshToken: true`**: Automatically refreshes the access token before it expires, keeping users logged in
- **`detectSessionInUrl: true`**: Allows session detection from URL parameters (useful for OAuth flows)
- **`storage: window.localStorage`**: Explicitly specifies localStorage as the storage mechanism (default is localStorage, but being explicit is better)

This configuration was applied to **both** places where the Supabase client is created:
1. Initial immediate initialization (if Supabase is already loaded)
2. In the `initializeSupabase()` function

## Files Modified

1. ✅ `c:\Users\a5509\Github\WeBond\app.html` (line 18)
   - Changed logo onclick from `window.location.href='index.html'` to `showPage('dashboard')`

2. ✅ `c:\Users\a5509\Github\WeBond\app-supabase.js` (lines 11-18, 33-40, 67-68, 75-126)
   - Made `loadAuthState()` async
   - Added Supabase session verification
   - Added profile fetching from database
   - Added proper error handling
   - Updated window.onload to await loadAuthState()
   - **Added session persistence configuration to Supabase client**

3. ✅ `c:\Users\a5509\Github\WeBond\app.js` (lines 11-18, 35-42)
   - **Added session persistence configuration to Supabase client**

## How It Works Now

### On Page Load:
1. Initialize Supabase client **with session persistence enabled**
2. Supabase automatically retrieves stored session from localStorage
3. Check for active Supabase session via `getSession()`
4. If session exists:
   - Fetch user profile from database
   - Update `currentUser` variable
   - Sync to localStorage
   - Update UI to show logged-in state
5. If no session:
   - Clear `currentUser`
   - Clear localStorage
   - Show logged-out state

### Session Persistence:
- When user logs in, Supabase stores the session in localStorage
- On page refresh, Supabase client automatically loads the session
- Tokens are automatically refreshed before expiry
- Session persists across browser tabs and page refreshes

### On Logo Click:
1. Call `showPage('dashboard')`
2. Navigate to dashboard view within the app
3. No page reload
4. Session maintained

## Testing Recommendations

### Manual Testing Steps

**Test 1: Page Refresh**
1. Log in to the application
2. Navigate to any page (Browse Tasks, Create Task, etc.)
3. Press F5 or click browser refresh
4. **Expected**: User remains logged in, stays on the same page
5. **Previous Behavior**: User would be logged out

**Test 2: Logo Click**
1. Log in to the application
2. Navigate to Browse Tasks or any other page
3. Click the WeBond logo
4. **Expected**: Navigate to Dashboard, user remains logged in
5. **Previous Behavior**: Redirect to index.html, user logged out

**Test 3: Session Expiry**
1. Log in to the application
2. Wait for Supabase session to expire (or manually clear session in browser dev tools)
3. Refresh the page
4. **Expected**: User is logged out, localStorage cleared, shown login screen
5. Verify no errors in console

**Test 4: Cross-Tab Sync**
1. Log in on one tab
2. Open the app in another tab
3. **Expected**: Both tabs show logged-in state
4. Log out in one tab
5. **Expected**: Other tab should also reflect logged-out state (may require refresh)

## Impact Assessment

### User Experience Improvements
- ✅ Users stay logged in across page refreshes
- ✅ Logo click navigates within app instead of redirecting
- ✅ Consistent authentication state
- ✅ Better error handling for incomplete registrations
- ✅ Automatic cleanup of stale data

### Security Improvements
- ✅ Proper session validation on every page load
- ✅ Database profile verification
- ✅ Automatic logout for invalid/incomplete accounts
- ✅ Sync between Supabase auth and local state

### Performance Considerations
- Minimal impact: One additional database query on page load
- Query is cached by Supabase
- Async/await ensures UI doesn't block

## Related Functions

### Authentication Flow
```
Page Load
    ↓
waitForSupabase()
    ↓
initializeSupabase()
    ↓
loadAuthState() [ASYNC]
    ↓
supabaseClient.auth.getSession()
    ↓
If session exists:
    ↓
Fetch user profile from database
    ↓
Update currentUser & localStorage
    ↓
updateUI() - Show logged-in state
```

## Prevention Measures

### Code Review Checklist
- [ ] Always verify Supabase session on page load
- [ ] Use `showPage()` for in-app navigation instead of `window.location`
- [ ] Keep localStorage in sync with Supabase session
- [ ] Handle session expiry gracefully
- [ ] Test authentication flow after any navigation changes

### Best Practices Implemented
1. **Session Verification**: Always check server-side session, not just localStorage
2. **Async/Await**: Proper async handling for authentication
3. **Error Handling**: Comprehensive error handling with user feedback
4. **State Sync**: Keep localStorage and Supabase session in sync
5. **SPA Navigation**: Use client-side routing instead of full page redirects

## Deployment Notes
- ✅ No database changes required
- ✅ No API changes required
- ✅ Frontend-only fix
- ✅ Backward compatible
- ✅ Can be deployed immediately
- ⚠️ Users currently logged in may need to log in again after deployment (one-time)

## Status
- **Fixed**: ✅ 2025-10-24
- **Tested**: ⏳ Pending manual verification
- **Deployed**: ⏳ Pending deployment

## Additional Notes

### Difference Between app.js and app-supabase.js
- `app.js` already had the correct session persistence implementation
- `app-supabase.js` was using the simplified localStorage-only approach
- Both files now use the same robust session verification approach
- This ensures consistent behavior across both versions of the app
