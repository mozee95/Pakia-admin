# 🐛 Authentication Bug Report: Invalid Token Error

## **Issue Summary**
Frontend admin dashboard users are getting `401 Unauthorized` errors with message "Invalid or expired token" when making API calls to admin endpoints, despite having valid Clerk authentication tokens and proper admin roles.

## **Environment**
- **Frontend**: React + Clerk (JWT tokens)
- **Backend**: NestJS + @clerk/backend (v1.33.1)
- **Auth Method**: Clerk JWT tokens via Authorization Bearer header
- **Affected Endpoints**: All `/api/admin/*` routes

## **Current Behavior (Bug)**
1. User signs in successfully with Clerk
2. Frontend gets valid JWT token from `getToken()`
3. API calls are made with `Authorization: Bearer <jwt_token>`
4. Backend returns `401 Unauthorized: "Invalid or expired token"`
5. Same error occurs regardless of user role (`admin`, `super_admin`)

## **Root Cause Identified**

### **Problem in ClerkAuthGuard**
The `ClerkAuthGuard` is using the **wrong Clerk SDK method** for token validation:

**❌ Current (Incorrect) Code:**
```typescript
// In src/auth/guards/clerk-auth.guard.ts
const session = await this.clerkClient.sessions.verifySession(token);
```

**Why this fails:**
- `verifySession()` expects a **session ID** as parameter
- Frontend sends **JWT tokens**, not session IDs
- This causes token validation to always fail

## **Required Fix**

### **1. Fix ClerkAuthGuard Token Validation**

**✅ Correct Implementation:**
```typescript
// Replace the verifySession call with verifyToken
try {
  // FIXED: Use verifyToken for JWT tokens
  const payload = await this.clerkClient.verifyToken(token);
  
  if (!payload || !payload.sub) {
    throw new UnauthorizedException('Invalid token');
  }

  // Get user data from Clerk
  const clerkUser = await this.clerkClient.users.getUser(payload.sub);

  // Add user info to request object
  request.user = {
    userId: payload.sub,
    sessionId: payload.sid, // session ID from JWT payload
    metadata: {
      ...clerkUser.publicMetadata,
      ...clerkUser.privateMetadata,
      ...clerkUser.unsafeMetadata,
    },
  };

  return true;
} catch (error) {
  console.error('Token verification error:', error);
  throw new UnauthorizedException('Invalid or expired token');
}
```

### **2. Update AdminAuthGuard Role Check**

**✅ Support Multiple Admin Roles:**
```typescript
// In src/auth/guards/admin-auth.guard.ts
const isAdmin = user?.metadata?.role === 'admin' || 
               user?.metadata?.role === 'super_admin' ||
               user?.metadata?.roles?.includes('admin') ||
               user?.metadata?.roles?.includes('super_admin');
```

## **Technical Details**

### **Token Flow**
1. **Frontend**: `getToken()` → Returns Clerk JWT token
2. **API Call**: `Authorization: Bearer <jwt_token>`
3. **Backend**: Should use `verifyToken(jwt)` not `verifySession(sessionId)`

### **Clerk SDK Methods**
- `verifyToken(token: string)` → Validates JWT tokens ✅
- `verifySession(sessionId: string)` → Validates session IDs ❌

## **Files to Modify**
1. `src/auth/guards/clerk-auth.guard.ts` - Fix token verification method
2. `src/auth/guards/admin-auth.guard.ts` - Add support for `super_admin` role

## **Testing Instructions**

### **Before Fix**
```bash
# This should return 401 Unauthorized
curl -H "Authorization: Bearer <valid_jwt_token>" \
     http://localhost:3000/api/admin/products/categories/all
```

### **After Fix**
```bash
# This should return categories data (200 OK)
curl -H "Authorization: Bearer <valid_jwt_token>" \
     http://localhost:3000/api/admin/products/categories/all
```

### **Test User Metadata**
Ensure test user has one of these in Clerk public metadata:
```json
{
  "role": "admin"
}
```
OR
```json
{
  "role": "super_admin"
}
```

## **Expected Result After Fix**
- ✅ Valid tokens are accepted
- ✅ Admin/super_admin users can access admin endpoints
- ✅ Frontend displays real data instead of fallback mock data
- ✅ API calls succeed with proper authentication

## **Priority**
**HIGH** - Blocking all admin functionality in production

## **Additional Notes**
- Frontend token refresh mechanism is working correctly
- CORS is configured properly
- Issue is isolated to backend token validation logic
- No changes needed on frontend side

---

**Reporter**: Frontend Team  
**Date**: May 29, 2025  
**Estimated Fix Time**: 15 minutes 