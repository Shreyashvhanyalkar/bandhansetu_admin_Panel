// src/utils/mockServer.js
// Intercepts fetch requests to backend endpoints and returns static mock data with CRUD support.

import { getStaticStore, saveStaticStore } from "./mockData";

// Store original fetch reference
const nativeFetch = window.fetch.bind(window);

/**
 * Handles incoming request URL and options to produce mock JSON response.
 */
export async function handleMockRequest(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const store = getStaticStore();

  // Parse URL & Query params
  let parsedUrl;
  try {
    parsedUrl = new URL(url, window.location.origin);
  } catch {
    parsedUrl = { pathname: url, searchParams: new URLSearchParams() };
  }

  const pathname = parsedUrl.pathname;
  const params = parsedUrl.searchParams || new URLSearchParams();

  // Parse JSON Body if present
  let body = null;
  if (options.body) {
    if (typeof options.body === "string") {
      try {
        body = JSON.parse(options.body);
      } catch {
        body = options.body;
      }
    } else {
      body = options.body;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 1. AUTHENTICATION & LOGIN
  // ───────────────────────────────────────────────────────────────────────────
  if (pathname.includes("/api/admin/login") || pathname.includes("/admin/login")) {
    const email = body?.email || "admin@bandhansetu.com";
    return mockResponse({
      status: true,
      message: "Login successful (Static Mode)",
      token: "mock-static-jwt-token-" + Date.now(),
      sessionKey: "mock-static-jwt-token-" + Date.now(),
      id: 1,
      first_name: "Admin",
      last_name: "User",
      firstName: "Admin",
      lastName: "User",
      email: email,
      deviceDetails: {
        sessionKey: "mock-static-jwt-token-" + Date.now()
      }
    });
  }

  if (pathname.includes("/api/auth/admin/logout") || pathname.includes("/admin/logout")) {
    return mockResponse({ status: true, message: "Logged out successfully" });
  }

  if (pathname === "/admin/profile" || pathname === "/api/admin/profile") {
    return mockResponse({
      id: 1,
      name: "Admin User",
      email: "admin@bandhansetu.com",
      role: "Super Admin",
      mobile: "+91 9876543210"
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. USER MANAGEMENT & APPROVE / REJECT
  // ───────────────────────────────────────────────────────────────────────────
  
  // Single User Profile
  if (pathname.match(/\/api\/auth\/admin\/userprofile\/(.+)/)) {
    const idMatch = pathname.match(/\/api\/auth\/admin\/userprofile\/(.+)/);
    const userId = idMatch ? idMatch[1] : null;
    const user = store.users.find((u) => String(u.id) === String(userId) || String(u.userId) === String(userId));
    if (user) {
      return mockResponse({ status: true, data: user, ...user });
    }
    // Return first user as fallback if specific ID not found
    return mockResponse({ status: true, data: store.users[0], ...store.users[0] });
  }

  // User Gallery
  if (pathname.match(/\/api\/auth\/user\/gallery\/(.+)/)) {
    const idMatch = pathname.match(/\/api\/auth\/user\/gallery\/(.+)/);
    const userId = idMatch ? idMatch[1] : null;
    const user = store.users.find((u) => String(u.id) === String(userId) || String(u.userId) === String(userId));
    const gallery = user?.gallery || [
      { id: 1, fileName: "profile.jpg", isProfilePicture: true, url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60" }
    ];
    return mockResponse(gallery);
  }

  // Image Download / Thumbnail
  if (pathname.includes("/api/file/download/")) {
    // Return transparent 1x1 SVG image blob
    const svgBlob = new Blob(
      ['<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f3f4f6"/></svg>'],
      { type: "image/svg+xml" }
    );
    return new Response(svgBlob, { status: 200, headers: { "Content-Type": "image/svg+xml" } });
  }

  // Pending Users (Redux slice endpoint)
  if (pathname === "/admin/users/pending") {
    const pending = store.users.filter((u) => u.status === 0 || u.rawStatus === 0);
    return mockResponse({ status: true, pending_users: pending });
  }

  // Approve User (Redux thunk)
  if (pathname.match(/\/admin\/users\/approve\/(.+)/)) {
    const match = pathname.match(/\/admin\/users\/approve\/(.+)/);
    const uId = match[1];
    store.users = store.users.map((u) => {
      if (String(u.id) === String(uId) || String(u.userId) === String(uId)) {
        return { ...u, status: 1, rawStatus: 1 };
      }
      return u;
    });
    saveStaticStore(store);
    return mockResponse({ status: true, message: "User approved successfully" });
  }

  // Users List (Infinite / Search / Standard)
  if (pathname.includes("/api/auth/admin/users")) {
    const search = params.get("search") || params.get("q") || "";
    const statusParam = params.get("status");
    const deletedParam = params.get("deleted");
    const gender = params.get("gender");
    const limit = parseInt(params.get("limit") || "50", 10);
    const offset = parseInt(params.get("offset") || "0", 10);

    let filtered = [...store.users];

    if (deletedParam === "true" || deletedParam === "1") {
      filtered = filtered.filter((u) => !!u.deleted_at);
    } else if (deletedParam === "false" || deletedParam === "0") {
      filtered = filtered.filter((u) => !u.deleted_at);
    }

    if (statusParam !== null && statusParam !== undefined) {
      const sVal = parseInt(statusParam, 10);
      filtered = filtered.filter((u) => u.status === sVal || u.rawStatus === sVal);
    }

    if (gender) {
      filtered = filtered.filter((u) => u.gender?.toLowerCase() === gender.toLowerCase());
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.firstName?.toLowerCase().includes(q) ||
          u.lastName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.platformId?.toLowerCase().includes(q) ||
          u.mobileNumber?.includes(q)
      );
    }

    const paged = filtered.slice(offset, offset + limit);

    return mockResponse({
      status: true,
      users: paged,
      data: paged,
      total: filtered.length,
      limit,
      offset
    });
  }

  // Toggle User Status API (`PUT`/`PATCH /api/auth/admin/users/status/:id` or `/api/auth/admin/users/:id/status`)
  if (pathname.includes("/api/auth/admin/users/status/") || pathname.match(/\/api\/auth\/admin\/users\/(.+)\/status/)) {
    const match = pathname.match(/\/api\/auth\/admin\/users\/status\/(.+)/) || pathname.match(/\/api\/auth\/admin\/users\/(.+)\/status/);
    const uId = match ? match[1] : null;
    const requestedStatus = body?.status;

    store.users = store.users.map((u) => {
      if (String(u.id) === String(uId) || String(u.userId) === String(uId)) {
        const nextStatus = requestedStatus !== undefined ? requestedStatus : (u.status === 1 ? 0 : 1);
        return { ...u, status: nextStatus, rawStatus: nextStatus };
      }
      return u;
    });
    saveStaticStore(store);
    return mockResponse({ status: true, message: "User status updated successfully" });
  }

  // Restore User API (`POST`/`PATCH /api/auth/admin/users/restore/:id` or `/api/auth/admin/users/:id/restore`)
  if (pathname.includes("/api/auth/admin/users/restore/") || pathname.match(/\/api\/auth\/admin\/users\/(.+)\/restore/)) {
    const match = pathname.match(/\/api\/auth\/admin\/users\/restore\/(.+)/) || pathname.match(/\/api\/auth\/admin\/users\/(.+)\/restore/);
    const uId = match ? match[1] : null;

    store.users = store.users.map((u) => {
      if (String(u.id) === String(uId) || String(u.userId) === String(uId)) {
        return { ...u, deleted_at: null };
      }
      return u;
    });
    saveStaticStore(store);
    return mockResponse({ status: true, message: "User restored successfully" });
  }

  // Delete User API (`DELETE /api/auth/admin/users/:id` or `/admin/users/delete/:id`)
  if ((pathname.match(/\/api\/auth\/admin\/users\/(.+)/) || pathname.match(/\/admin\/users\/delete\/(.+)/)) && method === "DELETE") {
    const match = pathname.match(/\/api\/auth\/admin\/users\/(.+)/) || pathname.match(/\/admin\/users\/delete\/(.+)/);
    const uId = match ? match[1] : null;

    store.users = store.users.map((u) => {
      if (String(u.id) === String(uId) || String(u.userId) === String(uId)) {
        return { ...u, deleted_at: new Date().toISOString() };
      }
      return u;
    });
    saveStaticStore(store);
    return mockResponse({ status: true, message: "User deleted successfully" });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. LOCATION MANAGEMENT (Countries, States, Cities)
  // ───────────────────────────────────────────────────────────────────────────

  // Country CRUD
  if (pathname.includes("/api/auth/admin/country")) {
    const idMatch = pathname.match(/\/country\/([^/?]+)/);
    const targetId = idMatch ? idMatch[1] : null;

    if (method === "GET") {
      return mockResponse({ status: true, countries: store.countries });
    }
    if (method === "POST") {
      const name = body?.country_name || body?.name || "New Country";
      const newCountry = {
        id: body?.id || Date.now(),
        country_name: name,
        name: name
      };
      store.countries.push(newCountry);
      saveStaticStore(store);
      return mockResponse({ status: true, message: "Country added successfully", country: newCountry });
    }
    if (method === "PUT" && targetId) {
      const name = body?.country_name || body?.name;
      store.countries = store.countries.map((c) =>
        String(c.id) === String(targetId) ? { ...c, country_name: name || c.country_name, name: name || c.name } : c
      );
      saveStaticStore(store);
      return mockResponse({ status: true, message: "Country updated successfully" });
    }
    if (method === "DELETE" && targetId) {
      store.countries = store.countries.filter((c) => String(c.id) !== String(targetId));
      const deletedStateIds = store.states.filter((s) => String(s.country_id) === String(targetId)).map((s) => String(s.id));
      store.states = store.states.filter((s) => String(s.country_id) !== String(targetId));
      store.cities = store.cities.filter((c) => !deletedStateIds.includes(String(c.state_id)));
      saveStaticStore(store);
      return mockResponse({ status: true, message: "Country deleted successfully" });
    }
  }

  // State CRUD
  if (pathname.includes("/api/auth/admin/state")) {
    const idMatch = pathname.match(/\/state\/([^/?]+)/);
    const targetId = idMatch ? idMatch[1] : null;
    const countryId = params.get("country_id");

    if (method === "GET") {
      let result = store.states;
      if (countryId) {
        result = result.filter((s) => String(s.country_id) === String(countryId));
      }
      return mockResponse({ status: true, states: result });
    }
    if (method === "POST") {
      const name = body?.state_name || body?.name || "New State";
      const newState = {
        id: body?.id || Date.now(),
        state_name: name,
        name: name,
        country_id: body?.country_id || 1
      };
      store.states.push(newState);
      saveStaticStore(store);
      return mockResponse({ status: true, message: "State added successfully", state: newState });
    }
    if (method === "PUT" && targetId) {
      const name = body?.state_name || body?.name;
      store.states = store.states.map((s) =>
        String(s.id) === String(targetId) ? { ...s, state_name: name || s.state_name, name: name || s.name } : s
      );
      saveStaticStore(store);
      return mockResponse({ status: true, message: "State updated successfully" });
    }
    if (method === "DELETE" && targetId) {
      store.states = store.states.filter((s) => String(s.id) !== String(targetId));
      store.cities = store.cities.filter((c) => String(c.state_id) !== String(targetId));
      saveStaticStore(store);
      return mockResponse({ status: true, message: "State deleted successfully" });
    }
  }

  // City CRUD
  if (pathname.includes("/api/auth/admin/city")) {
    const idMatch = pathname.match(/\/city\/([^/?]+)/);
    const targetId = idMatch ? idMatch[1] : null;
    const stateId = params.get("state_id");

    if (method === "GET") {
      let result = store.cities;
      if (stateId) {
        result = result.filter((c) => String(c.state_id) === String(stateId));
      }
      return mockResponse({ status: true, cities: result });
    }
    if (method === "POST") {
      const name = body?.city_name || body?.name || "New City";
      const newCity = {
        id: body?.id || Date.now(),
        city_name: name,
        name: name,
        state_id: body?.state_id || 1
      };
      store.cities.push(newCity);
      saveStaticStore(store);
      return mockResponse({ status: true, message: "City added successfully", city: newCity });
    }
    if (method === "PUT" && targetId) {
      const name = body?.city_name || body?.name;
      store.cities = store.cities.map((c) =>
        String(c.id) === String(targetId) ? { ...c, city_name: name || c.city_name, name: name || c.name } : c
      );
      saveStaticStore(store);
      return mockResponse({ status: true, message: "City updated successfully" });
    }
    if (method === "DELETE" && targetId) {
      store.cities = store.cities.filter((c) => String(c.id) !== String(targetId));
      saveStaticStore(store);
      return mockResponse({ status: true, message: "City deleted successfully" });
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. RELIGION & CASTE MANAGEMENT
  // ───────────────────────────────────────────────────────────────────────────

  // Religion CRUD
  if (pathname.includes("/api/auth/admin/religion")) {
    const idMatch = pathname.match(/\/religion\/([^/?]+)/);
    const targetId = idMatch ? idMatch[1] : null;

    if (method === "GET") {
      return mockResponse({ status: true, religions: store.religions, data: store.religions });
    }
    if (method === "POST") {
      const name = body?.religion_name || body?.name || "New Religion";
      const newReligion = {
        id: body?.id || Date.now(),
        religion_name: name,
        name: name
      };
      store.religions.push(newReligion);
      saveStaticStore(store);
      return mockResponse({ status: true, message: "Religion added successfully", religion: newReligion });
    }
    if (method === "PUT" && targetId) {
      const name = body?.religion_name || body?.name;
      store.religions = store.religions.map((r) =>
        String(r.id) === String(targetId) ? { ...r, religion_name: name || r.religion_name, name: name || r.name } : r
      );
      saveStaticStore(store);
      return mockResponse({ status: true, message: "Religion updated successfully" });
    }
    if (method === "DELETE" && targetId) {
      store.religions = store.religions.filter((r) => String(r.id) !== String(targetId));
      const deletedCasteIds = store.castes.filter((c) => String(c.religion_id) === String(targetId)).map((c) => String(c.id));
      store.castes = store.castes.filter((c) => String(c.religion_id) !== String(targetId));
      store.subcastes = store.subcastes.filter((sc) => !deletedCasteIds.includes(String(sc.caste_id)));
      saveStaticStore(store);
      return mockResponse({ status: true, message: "Religion deleted successfully" });
    }
  }

  // Caste CRUD
  if (pathname.includes("/api/auth/admin/caste")) {
    const idMatch = pathname.match(/\/caste\/([^/?]+)/);
    const targetId = idMatch ? idMatch[1] : null;
    const religionId = params.get("religion_id");

    if (method === "GET") {
      let result = store.castes;
      if (religionId) {
        result = result.filter((c) => String(c.religion_id) === String(religionId));
      }
      return mockResponse({ status: true, castes: result, data: result });
    }
    if (method === "POST") {
      const name = body?.caste_name || body?.name || "New Caste";
      const newCaste = {
        id: body?.id || Date.now(),
        caste_name: name,
        name: name,
        religion_id: body?.religion_id || 1
      };
      store.castes.push(newCaste);
      saveStaticStore(store);
      return mockResponse({ status: true, message: "Caste added successfully", caste: newCaste });
    }
    if (method === "PUT" && targetId) {
      const name = body?.caste_name || body?.name;
      store.castes = store.castes.map((c) =>
        String(c.id) === String(targetId) ? { ...c, caste_name: name || c.caste_name, name: name || c.name } : c
      );
      saveStaticStore(store);
      return mockResponse({ status: true, message: "Caste updated successfully" });
    }
    if (method === "DELETE" && targetId) {
      store.castes = store.castes.filter((c) => String(c.id) !== String(targetId));
      store.subcastes = store.subcastes.filter((sc) => String(sc.caste_id) !== String(targetId));
      saveStaticStore(store);
      return mockResponse({ status: true, message: "Caste deleted successfully" });
    }
  }

  // Subcaste CRUD
  if (pathname.includes("/api/auth/admin/subcast")) {
    const idMatch = pathname.match(/\/subcast\/([^/?]+)/);
    const targetId = idMatch ? idMatch[1] : null;
    const casteId = params.get("caste_id");

    if (method === "GET") {
      let result = store.subcastes;
      if (casteId) {
        result = result.filter((sc) => String(sc.caste_id) === String(casteId));
      }
      return mockResponse({ status: true, subcastes: result, data: result });
    }
    if (method === "POST") {
      const name = body?.subcaste_name || body?.subcast_name || body?.name || "New Subcaste";
      const newSubcaste = {
        id: body?.id || Date.now(),
        subcast_name: name,
        subcaste_name: name,
        name: name,
        caste_id: body?.caste_id || 1
      };
      store.subcastes.push(newSubcaste);
      saveStaticStore(store);
      return mockResponse({ status: true, message: "Subcaste added successfully", subcaste: newSubcaste });
    }
    if (method === "PUT" && targetId) {
      const name = body?.subcaste_name || body?.subcast_name || body?.name;
      store.subcastes = store.subcastes.map((sc) =>
        String(sc.id) === String(targetId) ? {
          ...sc,
          subcast_name: name || sc.subcast_name,
          subcaste_name: name || sc.subcaste_name,
          name: name || sc.name
        } : sc
      );
      saveStaticStore(store);
      return mockResponse({ status: true, message: "Subcaste updated successfully" });
    }
    if (method === "DELETE" && targetId) {
      store.subcastes = store.subcastes.filter((sc) => String(sc.id) !== String(targetId));
      saveStaticStore(store);
      return mockResponse({ status: true, message: "Subcaste deleted successfully" });
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 5. NOTIFICATIONS & BANNERS
  // ───────────────────────────────────────────────────────────────────────────
  if (pathname.includes("/api/auth/admin/notifications/send")) {
    const newNotif = {
      id: Date.now(),
      title: body?.title || "Notification",
      message: body?.message || "Sample message",
      sent_to: body?.target || "All",
      created_at: new Date().toISOString()
    };
    store.notifications.unshift(newNotif);
    saveStaticStore(store);
    return mockResponse({ status: true, message: "Notification sent successfully" });
  }

  if (pathname.includes("/api/auth/admin/notifications")) {
    return mockResponse({ status: true, notifications: store.notifications });
  }

  if (pathname.includes("/api/auth/admin/upload-banner")) {
    const newBanner = {
      id: Date.now(),
      title: "New Promo Banner",
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60",
      active: true,
      created_at: new Date().toISOString()
    };
    store.banners.unshift(newBanner);
    saveStaticStore(store);
    return mockResponse({ status: true, message: "Banner uploaded successfully" });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 6. DASHBOARD & ANALYTICS
  // ───────────────────────────────────────────────────────────────────────────
  if (pathname.includes("/admin/dashboard/stats")) {
    return mockResponse({
      status: true,
      total_users: store.users.length * 150 || 1248,
      active_requests: 45,
      pending_approvals: store.users.filter((u) => u.status === 0).length || 12,
      completed_matches: 89,
      monthly_growth: 23,
      approval_rate: 78
    });
  }

  if (pathname.includes("/admin/dashboard/activities")) {
    return mockResponse({
      status: true,
      activities: [
        { id: 1, action: "User Approved", target: "Rahul Sharma", time: "10 minutes ago" },
        { id: 2, action: "New Registration", target: "Sneha Patel", time: "25 minutes ago" },
        { id: 3, action: "Banner Updated", target: "Matrimony Expo Banner", time: "1 hour ago" },
        { id: 4, action: "Location Added", target: "City: Pune", time: "3 hours ago" }
      ]
    });
  }

  if (pathname.includes("/admin/dashboard/monthly")) {
    return mockResponse({
      status: true,
      monthly_data: [
        { month: "Jan", users: 120, matches: 35 },
        { month: "Feb", users: 180, matches: 50 },
        { month: "Mar", users: 240, matches: 75 }
      ]
    });
  }

  if (pathname.includes("/admin/reports/download")) {
    const csvBlob = new Blob(["Month,Users,Matches\nJan,120,35\nFeb,180,50\nMar,240,75\n"], {
      type: "text/csv"
    });
    return new Response(csvBlob, { status: 200, headers: { "Content-Type": "text/csv" } });
  }

  // Default fallback mock response for any unhandled API route
  return mockResponse({ status: true, message: "Static Mock API Success", data: [] });
}

// Helper to wrap JSON in standard fetch Response object
function mockResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

// Intercept window.fetch globally
export function enableStaticMockServer() {
  if (window.__STATIC_MOCK_ENABLED__) return;
  window.__STATIC_MOCK_ENABLED__ = true;

  window.fetch = async function (input, init) {
    const url = typeof input === "string" ? input : input?.url || "";
    
    // Check if url is a backend endpoint
    if (
      url.includes("/api/") ||
      url.includes("/admin/") ||
      url.startsWith("http://localhost") ||
      url.startsWith("https://") && (url.includes("api") || url.includes("admin"))
    ) {
      try {
        return await handleMockRequest(url, init);
      } catch (err) {
        console.error("Mock Server error handling request:", url, err);
        return mockResponse({ status: true, data: [] });
      }
    }

    // Pass through to native fetch for non-API calls (e.g. assets, CDN, vite HMR)
    return nativeFetch(input, init);
  };

  console.log("🚀 BandhanSetuAdmin: Static Mock Server with LocalStorage CRUD Enabled!");
}
