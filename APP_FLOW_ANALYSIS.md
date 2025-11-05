# Application Flow Analysis - Head Huntd

## Complete User Journey & Data Flow

### 1. SIGNUP PAGE (`/signup`)
**Fields Captured:**
- ✅ fullName
- ✅ email
- ✅ mobileNumber
- ✅ password
- ✅ agreeToTerms (validation only, not stored)

**Storage:** Temporarily stored in `sessionStorage` as 'signupData'
**Action:** Validates email doesn't exist, then redirects to `/signup/role-selection`

---

### 2. ROLE SELECTION PAGE (`/signup/role-selection`)
**Fields Captured:**
- ✅ selectedGoal ('find-work', 'find-workers', 'search-companies')
- ✅ userRole ('employee' or 'employer') - derived from selectedGoal

**Storage:** Stored in `sessionStorage` as 'selectedGoal' and 'userRole'
**Action:** Redirects to `/signup/subscription`

---

### 3. SUBSCRIPTION PAGE (`/signup/subscription`)
**Action:** Creates Stripe Checkout session
**Data Sent to Stripe:**
- email
- fullName
- mobileNumber
- password
- role
- selectedGoal

**Storage:** Metadata sent to Stripe
**Action:** Redirects to Stripe payment page

---

### 4. STRIPE WEBHOOK (`/api/stripe/webhook`)
**Trigger:** After successful payment
**Creates User Account with:**
- email
- password (hashed)
- fullName
- mobileNumber
- role
- selectedGoal
- subscriptionStatus: 'active'
- subscriptionCustomerId: Stripe customer ID
- subscription: Link to Subscription document

**Action:** Redirects to `/signup/success`

---

### 5. SUCCESS PAGE (`/signup/success`)
**Action:** 
- Clears sessionStorage
- Redirects immediately to `/onboarding/personal-details`

---

### 6. ONBOARDING STEP 1: PERSONAL DETAILS (`/onboarding/personal-details`)
**Fields Captured:**
- ✅ fullName (pre-filled from user account)
- ✅ email (pre-filled from user account)
- ✅ mobileNumber (pre-filled from user account)
- ✅ dateOfBirth
- ✅ address
- ✅ profileImage (Base64 compressed)
- ✅ showEmailOnProfile (default: true)
- ✅ showMobileOnProfile (default: true)

**Database Storage:**
```javascript
{
  fullName: "...",
  email: "...",
  mobileNumber: "...",
  personalDetails: {
    dateOfBirth: Date,
    address: "...",
    profileImage: "data:image/jpeg;base64...",
    showEmailOnProfile: true,
    showMobileOnProfile: true
  },
  onboarding: {
    personalDetailsCompleted: true,
    currentStep: 2
  }
}
```

**API:** `POST /api/onboarding/personal-details`
**Action:** Saves to database, generates JWT token, redirects to `/onboarding/personal-summary`

---

### 7. ONBOARDING STEP 2: PERSONAL SUMMARY (`/onboarding/personal-summary`)
**Fields Captured:**
- ✅ personalSummary (text description)

**Database Storage:**
```javascript
{
  personalSummary: {
    summary: "I am a concrete builder with 3 years..."
  },
  onboarding: {
    personalSummaryCompleted: true,
    currentStep: 3
  }
}
```

**API:** `POST /api/onboarding/personal-summary`
**Action:** Saves to database, redirects to `/onboarding/work-experience`

---

### 8. ONBOARDING STEP 3: WORK EXPERIENCE (`/onboarding/work-experience`)
**Fields Captured:**
- ✅ workStatus ('first-job', 'worked-before', 'currently-working')
- ✅ employmentTypes (object → array: ['full-time', 'part-time', 'casual'])
- ✅ selectedIndustry
- ✅ selectedRole
- ✅ highestEducation
- ✅ jobTitle / currentJobTitle
- ✅ companyName / currentCompany
- ✅ employmentDurationFrom
- ✅ employmentDurationTo
- ✅ workExperienceSummary
- ✅ yearsOfExperience

**Database Storage:**
```javascript
{
  workExperience: {
    workStatus: "...",
    employmentTypes: ['full-time', 'part-time'],
    industry: "Electrician",
    role: "...",
    yearsOfExperience: "...",
    highestEducation: "Bachelors",
    currentJobTitle: "...",
    currentCompany: "...",
    employmentDurationFrom: "...",
    employmentDurationTo: "...",
    workExperienceSummary: "..."
  },
  onboarding: {
    workExperienceCompleted: true,
    currentStep: 4
  }
}
```

**API:** `POST /api/onboarding/work-experience`
**Action:** Saves to database, redirects to `/onboarding/availability`

---

### 9. ONBOARDING STEP 4: AVAILABILITY (`/onboarding/availability`)
**Fields Captured:**
- ✅ availability (object → array: ['morning', 'afternoon', 'evening'])
- ✅ dateRange (from, to)
- ✅ noticePreference ('immediately', '1-week', '2-weeks', '1-month', 'flexible')

**Database Storage:**
```javascript
{
  availability: {
    preferredWorkTimes: ['morning', 'afternoon'],
    dateRange: {
      from: Date,
      to: Date
    },
    noticePreference: "immediately"
  },
  onboarding: {
    availabilityCompleted: true,
    completed: true
  }
}
```

**API:** `POST /api/onboarding/availability`
**Action:** Marks onboarding complete, redirects to `/home`

---

### 10. HOME PAGE (`/home`)
**Fetches user data from:** `GET /api/auth/me`
**Displays:**
- User profile with image
- Personal summary (About section)
- Work experience details
- Availability information
- Job search functionality

---

## DATABASE SCHEMA STRUCTURE

### Final User Document Structure:
```javascript
{
  // From Signup
  email: "user@example.com",
  password: "hashed_password",
  fullName: "John Doe",
  mobileNumber: "+1234567890",
  role: "employee",
  selectedGoal: "find-work",
  
  // From Onboarding Step 1
  personalDetails: {
    dateOfBirth: ISODate("1990-01-01"),
    address: "123 Main St",
    profileImage: "data:image/jpeg;base64,/9j/4AAQ...",
    showEmailOnProfile: true,
    showMobileOnProfile: true
  },
  
  // From Onboarding Step 2
  personalSummary: {
    summary: "I am an experienced professional..."
  },
  
  // From Onboarding Step 3
  workExperience: {
    workStatus: "currently-working",
    employmentTypes: ["full-time", "part-time"],
    industry: "Electrician",
    role: "Senior Electrician",
    yearsOfExperience: "5",
    highestEducation: "Bachelors",
    currentJobTitle: "Lead Electrician",
    currentCompany: "ABC Corp",
    employmentDurationFrom: "2020-01",
    employmentDurationTo: "2025-11",
    workExperienceSummary: "Led projects..."
  },
  
  // From Onboarding Step 4
  availability: {
    preferredWorkTimes: ["morning", "afternoon"],
    dateRange: {
      from: ISODate("2025-11-19"),
      to: ISODate("2025-12-09")
    },
    noticePreference: "immediately"
  },
  
  // Progress Tracking
  onboarding: {
    personalDetailsCompleted: true,
    personalSummaryCompleted: true,
    workExperienceCompleted: true,
    availabilityCompleted: true,
    completed: true,
    currentStep: 5
  },
  
  // Subscription
  subscription: ObjectId("..."),
  subscriptionStatus: "active",
  subscriptionCustomerId: "cus_...",
  
  // Metadata
  isActive: true,
  isVerified: false,
  isEmailVerified: false,
  loginAttempts: 0,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## CLEANED UP - REMOVED FROM SCHEMA:
- ❌ Legacy `dateOfBirth` (root level)
- ❌ Legacy `address` (root level)
- ❌ Legacy `profileImage` (root level)
- ❌ Legacy `showEmailOnProfile` (root level)
- ❌ Legacy `showMobileOnProfile` (root level)
- ❌ Legacy `personalSummary` (root level string)
- ❌ Entire `profile` object with firstName, lastName, gender, city, etc.
- ❌ `skills`, `certifications`, `languages` from personalSummarySchema
- ❌ `previousJobs` array from workExperienceSchema
- ❌ `status` field from availabilitySchema

---

## KEY ISSUES FIXED:
1. ✅ Removed all legacy/duplicate fields
2. ✅ Work experience now saves ALL fields including duration and summary
3. ✅ Availability converts object to array properly
4. ✅ Employment types converts object to array properly
5. ✅ Profile image saves in personalDetails.profileImage
6. ✅ Onboarding object uses nested structure in User.create()

---

## AUTHENTICATION FLOW:
1. **Signup** → Data stored in sessionStorage → No account created yet
2. **Role Selection** → Role stored in sessionStorage
3. **Payment** → Stripe webhook creates account with hashed password
4. **Onboarding** → User logs in with JWT token
5. **Login** → Password comparison with bcrypt

---

## DATA VALIDATION:
- Email: Must be unique and valid format
- Password: Minimum 8 characters (enforced in schema and frontend)
- All onboarding fields: Optional but saved even if empty
- Employment types: Converted from UI object to array
- Availability times: Converted from UI object to array

---

## APIS SUMMARY:
- `POST /api/auth/check-email` - Check if email exists
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/stripe/create-checkout-session` - Create Stripe payment
- `POST /api/stripe/webhook` - Handle Stripe events (creates user account)
- `POST /api/onboarding/personal-details` - Save step 1 (creates user if from signup)
- `POST /api/onboarding/personal-summary` - Save step 2
- `POST /api/onboarding/work-experience` - Save step 3
- `POST /api/onboarding/availability` - Save step 4

---

## CURRENT STATUS:
✅ Schema cleaned - All legacy fields removed
✅ All onboarding data saves correctly
✅ Images save as Base64 in database
✅ Password hashing works with bcrypt
✅ Work experience saves ALL fields
✅ Availability conversion works
✅ Employment types conversion works
