// src/utils/mockData.js
// Centralized Static Mock Data Store with LocalStorage CRUD operations

const STORAGE_KEY = "BANDHANSETU_STATIC_DATA_V2";

const initialData = {
  users: [
    {
      id: 1,
      userId: 1,
      platform_id: "BS1001",
      platformId: "BS1001",
      first_name: "Rahul",
      last_name: "Sharma",
      firstName: "Rahul",
      lastName: "Sharma",
      email: "rahul.sharma@example.com",
      mobile_number: "9876543210",
      mobileNumber: "9876543210",
      country_code: "+91",
      countryCode: "+91",
      status: 1,
      rawStatus: 1,
      deleted_at: null,
      gender: "Male",
      age: 28,
      date_of_birth: "1996-05-15",
      marital_status: "Never Married",
      height: "5 ft 10 in",
      weight: "72 kg",
      blood_group: "O+",
      diet: "Vegetarian",
      cityName: "Mumbai",
      city_name: "Mumbai",
      stateName: "Maharashtra",
      state_name: "Maharashtra",
      countryName: "India",
      country_name: "India",
      religionName: "Hindu",
      religion_name: "Hindu",
      casteName: "Brahmin",
      caste_name: "Brahmin",
      subCasteName: "Deshastha",
      subcaste_name: "Deshastha",
      mother_tongue: "Hindi",
      qualification: "B.Tech Computer Science",
      occupation: "Software Engineer",
      income: "15 LPA",
      company_name: "Tech Solutions Pvt Ltd",
      created_at: "2026-01-10T10:00:00.000Z",
      createdAt: "2026-01-10T10:00:00.000Z",
      about: "Passionate software engineer based in Mumbai. Looking for a well-educated, understanding partner with strong family values.",
      partner_preference: {
        age_range: "23-27",
        min_height: "5 ft 2 in",
        qualification: "Graduate / Post Graduate",
        marital_status: "Never Married",
        religion: "Hindu",
        diet: "Vegetarian / Eggetarian"
      },
      gallery: [
        { id: 101, fileName: "rahul_1.jpg", isProfilePicture: true, url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60" },
        { id: 102, fileName: "rahul_2.jpg", isProfilePicture: false, url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60" }
      ]
    },
    {
      id: 2,
      userId: 2,
      platform_id: "BS1002",
      platformId: "BS1002",
      first_name: "Ananya",
      last_name: "Sen",
      firstName: "Ananya",
      lastName: "Sen",
      email: "ananya.sen@example.com",
      mobile_number: "9876543211",
      mobileNumber: "9876543211",
      country_code: "+91",
      countryCode: "+91",
      status: 0,
      rawStatus: 0,
      deleted_at: null,
      gender: "Female",
      age: 26,
      date_of_birth: "1998-08-22",
      marital_status: "Never Married",
      height: "5 ft 5 in",
      weight: "58 kg",
      blood_group: "A+",
      diet: "Non-Vegetarian",
      cityName: "Pune",
      city_name: "Pune",
      stateName: "Maharashtra",
      state_name: "Maharashtra",
      countryName: "India",
      country_name: "India",
      religionName: "Hindu",
      religion_name: "Hindu",
      casteName: "Maratha",
      caste_name: "Maratha",
      subCasteName: "96 Kuli",
      subcaste_name: "96 Kuli",
      mother_tongue: "Marathi",
      qualification: "MBA Finance",
      occupation: "Financial Analyst",
      income: "12 LPA",
      company_name: "FinTech Global",
      created_at: "2026-01-15T14:30:00.000Z",
      createdAt: "2026-01-15T14:30:00.000Z",
      about: "Energetic and career-oriented finance professional who loves travelling and reading.",
      partner_preference: {
        age_range: "26-30",
        min_height: "5 ft 8 in",
        qualification: "MBA / B.Tech",
        marital_status: "Never Married",
        religion: "Hindu",
        diet: "Any"
      },
      gallery: [
        { id: 201, fileName: "ananya_1.jpg", isProfilePicture: true, url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60" }
      ]
    },
    {
      id: 3,
      userId: 3,
      platform_id: "BS1003",
      platformId: "BS1003",
      first_name: "Vikram",
      last_name: "Malhotra",
      firstName: "Vikram",
      lastName: "Malhotra",
      email: "vikram.m@example.com",
      mobile_number: "9876543212",
      mobileNumber: "9876543212",
      country_code: "+91",
      countryCode: "+91",
      status: 1,
      rawStatus: 1,
      deleted_at: null,
      gender: "Male",
      age: 30,
      date_of_birth: "1994-03-10",
      marital_status: "Never Married",
      height: "6 ft 0 in",
      weight: "78 kg",
      blood_group: "B+",
      diet: "Vegetarian",
      cityName: "Ahmedabad",
      city_name: "Ahmedabad",
      stateName: "Gujarat",
      state_name: "Gujarat",
      countryName: "India",
      country_name: "India",
      religionName: "Hindu",
      religion_name: "Hindu",
      casteName: "Patel",
      caste_name: "Patel",
      subCasteName: "Leva Patel",
      subcaste_name: "Leva Patel",
      mother_tongue: "Gujarati",
      qualification: "MS Data Science",
      occupation: "Data Scientist",
      income: "22 LPA",
      company_name: "AI Insights",
      created_at: "2026-02-01T09:15:00.000Z",
      createdAt: "2026-02-01T09:15:00.000Z",
      about: "Data scientist with a passion for tech startups and outdoor sports.",
      partner_preference: {
        age_range: "25-29",
        min_height: "5 ft 4 in",
        qualification: "Graduate",
        marital_status: "Never Married",
        religion: "Hindu",
        diet: "Vegetarian"
      },
      gallery: [
        { id: 301, fileName: "vikram_1.jpg", isProfilePicture: true, url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60" }
      ]
    },
    {
      id: 4,
      userId: 4,
      platform_id: "BS1004",
      platformId: "BS1004",
      first_name: "Sneha",
      last_name: "Patel",
      firstName: "Sneha",
      lastName: "Patel",
      email: "sneha.patel@example.com",
      mobile_number: "9876543213",
      mobileNumber: "9876543213",
      country_code: "+91",
      countryCode: "+91",
      status: 0,
      rawStatus: 0,
      deleted_at: null,
      gender: "Female",
      age: 25,
      date_of_birth: "1999-11-04",
      marital_status: "Never Married",
      height: "5 ft 4 in",
      weight: "54 kg",
      blood_group: "O+",
      diet: "Vegetarian",
      cityName: "Surat",
      city_name: "Surat",
      stateName: "Gujarat",
      state_name: "Gujarat",
      countryName: "India",
      country_name: "India",
      religionName: "Hindu",
      religion_name: "Hindu",
      casteName: "Patel",
      caste_name: "Patel",
      subCasteName: "Kadva Patel",
      subcaste_name: "Kadva Patel",
      mother_tongue: "Gujarati",
      qualification: "B.Arch",
      occupation: "Architect",
      income: "10 LPA",
      company_name: "Design Studio",
      created_at: "2026-02-12T11:45:00.000Z",
      createdAt: "2026-02-12T11:45:00.000Z",
      about: "Architectural designer loving modern interior design and watercolor painting.",
      partner_preference: {
        age_range: "26-30",
        min_height: "5 ft 7 in",
        qualification: "Graduate",
        marital_status: "Never Married",
        religion: "Hindu",
        diet: "Vegetarian"
      },
      gallery: [
        { id: 401, fileName: "sneha_1.jpg", isProfilePicture: true, url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60" }
      ]
    },
    {
      id: 5,
      userId: 5,
      platform_id: "BS1005",
      platformId: "BS1005",
      first_name: "Sameer",
      last_name: "Khan",
      firstName: "Sameer",
      lastName: "Khan",
      email: "sameer.khan@example.com",
      mobile_number: "9876543214",
      mobileNumber: "9876543214",
      country_code: "+91",
      countryCode: "+91",
      status: 1,
      rawStatus: 1,
      deleted_at: null,
      gender: "Male",
      age: 29,
      date_of_birth: "1995-07-19",
      marital_status: "Never Married",
      height: "5 ft 11 in",
      weight: "75 kg",
      blood_group: "AB+",
      diet: "Non-Vegetarian",
      cityName: "Mumbai",
      city_name: "Mumbai",
      stateName: "Maharashtra",
      state_name: "Maharashtra",
      countryName: "India",
      country_name: "India",
      religionName: "Muslim",
      religion_name: "Muslim",
      casteName: "Sunni",
      caste_name: "Sunni",
      subCasteName: "Syed",
      subcaste_name: "Syed",
      mother_tongue: "Urdu",
      qualification: "MD Physician",
      occupation: "Doctor",
      income: "25 LPA",
      company_name: "City Hospital",
      created_at: "2026-02-18T16:20:00.000Z",
      createdAt: "2026-02-18T16:20:00.000Z",
      about: "Medical professional looking for a compassionate life partner.",
      partner_preference: {
        age_range: "24-28",
        min_height: "5 ft 3 in",
        qualification: "MBBS / Post Graduate",
        marital_status: "Never Married",
        religion: "Muslim",
        diet: "Non-Vegetarian"
      },
      gallery: [
        { id: 501, fileName: "sameer_1.jpg", isProfilePicture: true, url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60" }
      ]
    }
  ],
  countries: [
    { id: 1, country_name: "India" },
    { id: 2, country_name: "United States" },
    { id: 3, country_name: "Canada" },
    { id: 4, country_name: "United Kingdom" },
    { id: 5, country_name: "Australia" }
  ],
  states: [
    { id: 1, state_name: "Maharashtra", country_id: 1 },
    { id: 2, state_name: "Gujarat", country_id: 1 },
    { id: 3, state_name: "Delhi", country_id: 1 },
    { id: 4, state_name: "California", country_id: 2 },
    { id: 5, state_name: "New York", country_id: 2 },
    { id: 6, state_name: "Ontario", country_id: 3 },
    { id: 7, state_name: "Greater London", country_id: 4 }
  ],
  cities: [
    { id: 1, city_name: "Mumbai", state_id: 1 },
    { id: 2, city_name: "Pune", state_id: 1 },
    { id: 3, city_name: "Nagpur", state_id: 1 },
    { id: 4, city_name: "Ahmedabad", state_id: 2 },
    { id: 5, city_name: "Surat", state_id: 2 },
    { id: 6, city_name: "New Delhi", state_id: 3 },
    { id: 7, city_name: "Los Angeles", state_id: 4 },
    { id: 8, city_name: "San Francisco", state_id: 4 },
    { id: 9, city_name: "New York City", state_id: 5 },
    { id: 10, city_name: "Toronto", state_id: 6 }
  ],
  religions: [
    { id: 1, religion_name: "Hindu" },
    { id: 2, religion_name: "Muslim" },
    { id: 3, religion_name: "Sikh" },
    { id: 4, religion_name: "Christian" },
    { id: 5, religion_name: "Jain" },
    { id: 6, religion_name: "Buddhist" }
  ],
  castes: [
    { id: 1, caste_name: "Brahmin", religion_id: 1 },
    { id: 2, caste_name: "Maratha", religion_id: 1 },
    { id: 3, caste_name: "Rajput", religion_id: 1 },
    { id: 4, caste_name: "Patel", religion_id: 1 },
    { id: 5, caste_name: "Sunni", religion_id: 2 },
    { id: 6, caste_name: "Shia", religion_id: 2 },
    { id: 7, caste_name: "Jat Sikh", religion_id: 3 },
    { id: 8, caste_name: "Catholic", religion_id: 4 }
  ],
  subcastes: [
    { id: 1, subcast_name: "Deshastha", caste_id: 1 },
    { id: 2, subcast_name: "Kokanastha", caste_id: 1 },
    { id: 3, subcast_name: "96 Kuli", caste_id: 2 },
    { id: 4, subcast_name: "Leva Patel", caste_id: 4 },
    { id: 5, subcast_name: "Kadva Patel", caste_id: 4 }
  ],
  notifications: [
    {
      id: 1,
      title: "Welcome Special Offer",
      message: "Get 20% discount on all premium matrimony packages this week.",
      sent_to: "All Users",
      created_at: "2026-03-01T10:00:00.000Z"
    },
    {
      id: 2,
      title: "Complete Your Profile",
      message: "Please upload your ID proof to get the verified badge on your profile.",
      sent_to: "Pending Users",
      created_at: "2026-03-02T14:30:00.000Z"
    }
  ],
  banners: [
    {
      id: 1,
      title: "Grand Matrimony Expo 2026",
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60",
      active: true,
      created_at: "2026-02-20"
    }
  ],
  subadmins: [
    { id: 1, name: "Super Admin", email: "admin@bandhansetu.com", role: "Super Admin", status: "Active" },
    { id: 2, name: "Priya Verma", email: "priya@bandhansetu.com", role: "Moderator", status: "Active" },
    { id: 3, name: "Amit Shah", email: "amit@bandhansetu.com", role: "Support Admin", status: "Inactive" }
  ],
  dashboardStats: {
    totalUsers: 1248,
    activeRequests: 45,
    pendingApprovals: 12,
    completedMatches: 89,
    monthlyGrowth: 23,
    approvalRate: 78
  }
};

// Retrieve store from localStorage or populate defaults
export const getStaticStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return JSON.parse(JSON.stringify(initialData));
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error loading static store, resetting:", err);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return JSON.parse(JSON.stringify(initialData));
  }
};

export const saveStaticStore = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Error saving static store:", err);
  }
};
