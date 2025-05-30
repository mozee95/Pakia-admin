# 🔍 Backend Clarification Request: Products API Parameters

## **Issue Summary**
The Products page is returning `400 Bad Request` while Categories page works fine after authentication fix. Need clarification on expected API parameters for products endpoint.

## **Current Status**
- ✅ **Authentication**: Fixed and working (Categories load successfully)
- ✅ **CORS**: Configured correctly  
- ❌ **Products API**: Returns `400 Bad Request` with "Bad Request Exception"

## **Frontend Request Details**

### **Current API Call**
```
GET /api/admin/products?offset=0&limit=10
Headers: {
  Authorization: Bearer <valid_jwt_token>
  Content-Type: application/json
}
```

### **Expected Response Format**
Frontend expects this response structure:
```typescript
{
  data: Product[],
  meta?: {
    page: number,
    limit: number,
    total: number,
    totalPages?: number
  }
}
```

## **Questions for Backend Team**

### **1. Query Parameters**
What query parameters does `/api/admin/products` endpoint expect?

**Current frontend sends:**
- `offset=0` (calculated as: (page - 1) * limit)
- `limit=10` (items per page)

**Questions:**
- Does your endpoint expect `page` instead of `offset`?
- Does your endpoint expect `pageSize` instead of `limit`?
- Are there any **required** query parameters we're missing?
- What are the **allowed ranges** for limit/pageSize? (min/max values)

### **2. Response Format**
What is the exact response structure for successful requests?

**Options:**
```typescript
// Option A: Paginated wrapper
{
  data: Product[],
  pagination: { total, page, limit, totalPages }
}

// Option B: Direct array with meta
{
  products: Product[],
  meta: { total, page, limit }
}

// Option C: Direct array only
Product[]
```

### **3. Available Filters**
What optional filter parameters are supported?
- `category`/`categoryId`?
- `status`/`isActive`?
- `search`/`query`?
- `brand`/`brandId`?
- `stock` level filters?

### **4. Validation Rules**
What validation rules cause 400 errors?
- Minimum/maximum limit values?
- Required authentication headers?
- Specific parameter formats?

## **Test Requests Needed**

Please test these requests and share the responses:

### **Test 1: No Parameters**
```bash
curl -H "Authorization: Bearer <valid_token>" \
     http://localhost:3000/api/admin/products
```

### **Test 2: Page-based Pagination**
```bash
curl -H "Authorization: Bearer <valid_token>" \
     "http://localhost:3000/api/admin/products?page=1&limit=10"
```

### **Test 3: Alternative Parameter Names**
```bash
curl -H "Authorization: Bearer <valid_token>" \
     "http://localhost:3000/api/admin/products?page=1&pageSize=10"
```

### **Test 4: With Filters**
```bash
curl -H "Authorization: Bearer <valid_token>" \
     "http://localhost:3000/api/admin/products?page=1&limit=10&category=electronics"
```

## **Expected Information**

Please provide:

1. **✅ Working curl command** with correct parameters
2. **📋 Complete list** of supported query parameters  
3. **📄 Example response** structure with sample data
4. **⚠️ Validation rules** that trigger 400 errors
5. **🔧 Any differences** from the Categories API format

## **Comparison with Working Categories API**

**Categories API (Working):**
```
GET /api/admin/products/categories/all
Response: { data: Category[] }
```

**Products API (Failing):**
```
GET /api/admin/products?offset=0&limit=10
Response: 400 Bad Request Exception
```

## **Frontend Code Reference**

**Current implementation:**
```typescript
// In productService.ts
getProducts: async (filters?: TableFilters & { page?: number; limit?: number }) => {
  return apiService.getPaginated<Product>('/admin/products', filters);
}

// In api.ts - getPaginated method
const params = {
  ...filters,
  offset: filters?.page ? (filters.page - 1) * (filters.limit || 10) : 0,
  limit: filters?.limit || 10,
};
```

## **Priority**
**MEDIUM** - Products page shows mock data fallback, but real API integration needed for production.

---

**Reporter**: Frontend Team  
**Date**: May 29, 2025  
**Next Steps**: Await backend team response with correct parameters 