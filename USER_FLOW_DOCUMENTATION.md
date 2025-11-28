# Head Huntd - Complete User Flow Documentation
**From User's Perspective**

---

## Table of Contents
1. [Job Seeker / Employee Journey](#job-seeker--employee-journey)
2. [Employer / Head Hunter Journey](#employer--head-hunter-journey)
3. [Common Features](#common-features)
4. [Technical Flow Summary](#technical-flow-summary)

---

## Job Seeker / Employee Journey

### 1. Getting Started - Sign Up & Onboarding

#### **Step 1: Registration** (`/signup`)
**What you see:**
- Welcome screen with Head Huntd logo
- Clean signup form

**What you do:**
1. Enter your **Full Name**
2. Enter your **Email** (must be unique)
3. Enter your **Mobile Number**
4. Create a **Password** (8-15 characters, must include uppercase, lowercase, number, and special character)
5. Check the box to agree to Terms and Conditions
6. Click "Create account"

**What happens:**
- System checks if your email already exists
- If email is new, your data is temporarily saved
- You're redirected to choose your role

---

#### **Step 2: Role Selection** (`/signup/role-selection`)
**What you see:**
- Three goal options with visual cards

**What you do:**
Choose your goal:
- 🔍 **"I want to find work"** → Become a Job Hunter (employee/job seeker)
- 👥 **"I want to find workers"** → Become a Head Hunter (employer)
- 🏢 **"I want to search companies"** → Browse companies

**What happens:**
- Your role is saved (employee or employer)
- You're redirected to subscription payment

---

#### **Step 3: Payment** (`/signup/subscription`)
**What you see:**
- Stripe payment checkout page
- Subscription plan details

**What you do:**
1. Enter payment details
2. Complete payment through Stripe

**What happens:**
- Payment is processed securely
- Your account is **created in the database** with:
  - Hashed password
  - Email, name, phone
  - Active subscription status
- You're redirected to success page

---

#### **Step 4: Onboarding - Personal Details** (`/onboarding/personal-details`)
**What you see:**
- Form pre-filled with your name, email, and phone
- Upload profile photo option
- Privacy controls

**What you do:**
1. **Upload Profile Photo** (compressed to 400x400px)
2. Enter **Date of Birth**
3. Enter your **Address**
4. Toggle **Show Email on Profile** (default: ON)
5. Toggle **Show Mobile on Profile** (default: ON)
6. Click "Save & Continue"

**What happens:**
- Photo is compressed and saved as Base64
- All data saved to database under `personalDetails` object
- JWT token is generated for your session
- Onboarding progress: Step 1 ✅ Complete

---

#### **Step 5: Onboarding - Personal Summary** (`/onboarding/personal-summary`)
**What you see:**
- Large text area for your professional summary

**What you do:**
1. Write a brief description about yourself (e.g., "I am a concrete builder with 3 years of experience...")
2. Click "Save & Continue"

**What happens:**
- Summary saved to database under `personalSummary.summary`
- Onboarding progress: Step 2 ✅ Complete

---

#### **Step 6: Onboarding - Work Experience** (`/onboarding/work-experience`)
**What you see:**
- Multi-step form adapting to your work status

**What you do:**

**6.1 Work Status:**
Choose one:
- "Looking for my first job"
- "I've worked before"
- "I'm currently working"

**6.2 Employment Preferences:**
- Select **Employment Types**: Full-time, Part-time, Casual (can select multiple)
- Select **Industry** (dropdown: Carpentry, Electrician, Concrete, Plumbing, etc.)
- Select **Role** within that industry
- Enter **Years of Experience**

**6.3 Education:**
- Select **Highest Education**: High School, Certificate, Diploma, Bachelors, Masters, PhD

**6.4 Current/Previous Job (if applicable):**
- **Job Title**
- **Company Name**
- **Employment Duration** (From - To dates)
- **Work Summary** (describe your responsibilities)

**What happens:**
- All fields saved to database under `workExperience` object
- Employment types converted from checkboxes to array (e.g., `['full-time', 'part-time']`)
- Onboarding progress: Step 3 ✅ Complete

---

#### **Step 7: Onboarding - Availability** (`/onboarding/availability`)
**What you see:**
- Calendar date picker
- Work time preferences
- Notice period options

**What you do:**
1. Select **Preferred Work Times**: Morning, Afternoon, Evening (can select multiple)
2. Pick **Date Range** when you're available to start
3. Choose **Notice Preference**:
   - Immediately available
   - 1 week notice
   - 2 weeks notice
   - 1 month notice
   - Flexible
4. Click "Complete Onboarding"

**What happens:**
- Availability saved to database under `availability` object
- Work times converted to array (e.g., `['morning', 'afternoon']`)
- **Onboarding marked as COMPLETE** ✅
- You're redirected to your Home dashboard

---

### 2. Home Dashboard - Job Seeker View

#### **What You See** (`/home`)
**Top Bar:**
- Head Huntd logo (click to refresh home)
- 💬 Messages icon (with unread count badge)
- 🔔 Notifications icon (with unread count badge)
- 👤 Profile icon
- ☰ Menu icon

**Main Tabs:**
- **Search Jobs** (default active)
- **My Applications**
- **Saved Jobs**
- **My Network**

---

#### **Tab 1: Search Jobs**

**What you see:**
- Search bar with filters
- List of available jobs
- Each job shows:
  - Job title
  - Company name
  - Location
  - Employment type
  - Salary range
  - Job description
  - ⭐ Save button (heart icon)
  - 💬 Request Chat button

**What you can do:**
1. **Search & Filter Jobs:**
   - Search by keywords
   - Filter by location
   - Filter by industry
   - Filter by employment type
   - Filter by work location (on-site/remote/hybrid)

2. **Save Jobs:**
   - Click ⭐ heart icon to save for later
   - Saved jobs appear in "Saved Jobs" tab

3. **View Job Details:**
   - Click on a job to see full description
   - See qualifications required
   - See salary details
   - See application deadline

4. **Apply or Chat:**
   - Click "Apply Now" to submit application
   - Click "Request Chat" to start conversation with employer

**What happens when you apply:**
- Application created in database
- Employer receives notification
- Application appears in your "My Applications" tab
- Status starts as "Pending"

---

#### **Tab 2: My Applications**

**What you see:**
- List of all jobs you've applied to
- Each application shows:
  - Job title
  - Company name
  - Status badge (Pending, Reviewing, Shortlisted, Accepted, Rejected)
  - Date applied
  - Last updated date

**Application Statuses:**
- 🟠 **Pending** - Waiting for employer review
- 🔵 **Reviewing** - Employer is reviewing your application
- ⭐ **Shortlisted** - You made the shortlist!
- 🎤 **Interviewing** - Interview scheduled
- ✅ **Accepted** - Congratulations! You got the job
- ❌ **Rejected** - Application declined
- ↩️ **Withdrawn** - You withdrew your application

**What you can do:**
- View application details
- Withdraw pending applications
- See interview details (if scheduled)
- Message employer through chat

---

#### **Tab 3: Saved Jobs**

**What you see:**
- All jobs you've saved/favorited
- Same job card format as Search Jobs
- Quick access to apply or remove from saved

**What you can do:**
- Apply to saved jobs
- Remove from saved list
- Chat with employer

---

#### **Tab 4: My Network**

**What you see:**
- **Search Connections** bar
- **Pending Requests** section (connection requests you received)
- **My Connections** list (accepted connections)
- Each connection shows:
  - Profile photo
  - Name
  - Job title
  - Location
  - Online status (green dot)

**What you can do:**
- Search for other users
- Accept/Reject connection requests
- View connection profiles
- Message connections directly
- Sort connections alphabetically

**Connection Flow:**
1. Employer sends you a connection request
2. You receive notification
3. Request appears in "Pending Requests"
4. You click "Accept" or "Reject"
5. If accepted, they appear in "My Connections"
6. You can now message them directly

---

### 3. Messaging System

#### **Access Messages** (`/chats`)
**How to open:**
- Click 💬 icon in top bar
- Click "Request Chat" on any job
- Click notification for new message

**What you see:**
**Left Sidebar (Chat List):**
- All your conversations
- Each chat shows:
  - Person's profile photo
  - Name
  - Last message preview
  - Timestamp
  - Unread count badge (if any)
  - Job title (if job-related)
  - "Direct Message" tag (if personal chat)

**Right Panel (Chat Window):**
- Full conversation history
- Profile info at top
- Message input at bottom

**Message Types:**
1. **Job-Related Chats** 🔒
   - Tied to specific job application
   - Shows job title
   - Can be closed by employer
   - Closes automatically when job closes

2. **Direct Messages** 📧
   - Personal conversations
   - Permanent (can't be closed)
   - Marked with green "Permanent" badge
   - Independent of any job

**What you can do:**
- Send text messages
- See message timestamps
- See read/unread status
- Refresh messages manually
- Auto-refresh every 1.5 seconds
- Navigate back to job from chat

**Chat Status Indicators:**
- 🟢 Green dot = Online
- 🔒 "Closed" badge = Chat closed by employer
- ❌ Red warning = Job has been closed

---

### 4. Profile Management

#### **View Your Profile**
**How to access:**
- Click 👤 Profile icon → View opens in home page
- Or click ☰ Menu → "My Profile Card"

**What you see:**
- Your profile photo
- Full name
- Job title / Role
- Location
- 5-star rating display
- **About** section with your summary
- **Work Experience** details
- **Availability Calendar** showing:
  - Start date
  - End date
  - Preferred work times (morning/afternoon/evening)
  - Notice preference

**Edit Your Profile:**
1. Click "Edit Profile" button
2. Update any information:
   - Full name
   - Email
   - Phone number
   - Date of birth
   - Address
   - Profile photo (upload new)
   - Summary
   - Job title
   - Role
3. Click "Save Changes"

**What happens:**
- All changes saved to database
- Profile updates reflected immediately
- Success message displayed

---

### 5. Notifications System

#### **Access Notifications**
**How to open:**
- Click 🔔 Bell icon in top bar
- Badge shows unread count

**Notification Types You Receive:**
- 📝 **Application Updates** - Status changes (reviewing, shortlisted, accepted, rejected)
- 💼 **New Job Matches** - Jobs matching your profile
- 💬 **New Messages** - Chat messages from employers
- 🎉 **Job Assigned** - You got the job!
- 📅 **Interview Scheduled** - Interview details
- 🔔 **Connection Requests** - New connection requests

**What you see for each notification:**
- Icon (emoji indicating type)
- Title
- Message
- Time ago (e.g., "2h ago")
- Sender name (if applicable)
- Read/unread status (unread shown with green highlight)

**What you can do:**
- Click notification to navigate to relevant page (job, chat, application)
- Mark individual as read
- Delete notification
- "Mark all as read" button

---

### 6. Settings & Account

#### **Access Settings**
**How to open:**
- Click ☰ Menu icon

**What you see:**
- "My Profile Card" → Opens profile view
- "Sign Out" → Logs you out

**Sign Out Process:**
1. Click "Sign Out"
2. Token removed from browser
3. Redirected to login page

---

## Employer / Head Hunter Journey

### 1. Getting Started - Sign Up & Onboarding

#### **Steps 1-3: Same as Job Seeker**
- Signup with email/password
- Select role: "I want to find workers" → Employer
- Complete payment subscription
- Account created with employer role

---

#### **Step 4: Onboarding - Business Summary** (`/employer/business-summary`)

**What you do:**
1. Upload **Company Logo**
2. Enter **Company Name**
3. Enter **Business Address**
4. Enter **Business Phone**
5. Enter **Company Description**
6. Select **Industry/Sector**
7. Enter **Company Size** (number of employees)
8. Click "Save & Continue"

**What happens:**
- Company info saved to `businessSummary` object
- Logo compressed and saved as Base64
- Onboarding complete
- Redirected to employer dashboard

---

### 2. Employer Dashboard

#### **What You See** (`/home`)
**Top Bar:** Same as job seeker
- Logo, Messages, Notifications, Profile, Menu

**Main Tabs:**
- **My Jobs** (default active)
- **Networks**

---

#### **Tab 1: My Jobs**

**What you see:**
- "+ Create New Job" button (prominent)
- List of your posted jobs
- Each job shows:
  - Job title
  - Status badge (Draft, Published, Closed, Filled)
  - Employment type
  - Location
  - Salary
  - Number of applications received
  - Number of views
  - Completion percentage (for drafts)
  - Created/Published dates

**Job Statuses:**
- 📝 **Draft** - Not published yet, still editing
- ✅ **Published** - Live and accepting applications
- 🔒 **Closed** - No longer accepting applications
- ✅ **Filled** - Position has been filled

**What you can do:**
1. **Create New Job** → Go to job creation wizard
2. **Continue Editing Draft** → Resume where you left off
3. **View Job Details** → See full job posting
4. **View Applications** → See all candidates
5. **Edit Published Job** → Update job details
6. **Close Job** → Stop accepting applications
7. **Delete Job** → Remove job posting

**Filtering:**
- Filter by: All, Drafts, Published, Closed
- Search by job title or location

---

### 3. Creating a Job Posting

#### **Create Job Landing** (`/employer/create-job`)

**What you see:**
- Beautiful landing page explaining the 4-step process:
  1. 💼 Job Details
  2. 📄 Job Summary
  3. 🎓 Qualifications (Optional)
  4. 💵 Post Job

**What you do:**
- Click "Start Creating Job →"

**What happens:**
- New job draft created in database
- Status: "draft"
- You're redirected to Step 1

---

#### **Step 1: Job Details** (`/employer/create-job/[jobId]/step-1`)

**What you do:**
1. Enter **Job Title** (e.g., "Senior Electrician")
2. Select **Employment Type**: Full-time, Part-time, Contract, Casual
3. Select **Industry Type** (dropdown: Electrician, Carpentry, Concrete, etc.)
4. Select **Minimum Experience Required**: 0-1 years, 1-3 years, 3-5 years, 5+ years
5. Click "Save & Continue"

**What happens:**
- Data saved to `jobDetails` object
- Progress: 25% complete
- Redirected to Step 2

---

#### **Step 2: Job Summary** (`/employer/create-job/[jobId]/step-2`)

**What you do:**
1. Write **Job Description** (detailed explanation of the role, responsibilities, what you're looking for)
2. Click "Save & Continue"

**What happens:**
- Description saved to `jobSummary.summary`
- Progress: 50% complete
- Redirected to Step 3

---

#### **Step 3: Qualifications (Optional)** (`/employer/create-job/[jobId]/step-3`)

**What you do:**
1. Add **Required Skills** (can add multiple, e.g., "Foundations", "Commercial", "Residential")
2. Add **Required Licenses** (e.g., "Current White Card", "Driver's License C Manual")
3. Add **Required Certifications** (if any)
4. Click "Save & Continue" or "Skip"

**What happens:**
- Qualifications saved as array to `qualifications.qualifications`
- Progress: 75% complete
- Redirected to Step 4

---

#### **Step 4: Post Job** (`/employer/create-job/[jobId]/step-4`)

**What you do:**
1. **Salary Information:**
   - Enter fixed salary OR salary range (min-max)
   - Select frequency: Hourly, Daily, Weekly, Monthly, Yearly

2. **Job Location:**
   - Select **Work Location Type**: On-site, Remote, Hybrid
   - Enter **Address**
   - Enter **City**
   - Enter **State**
   - Enter **Postcode**
   - Country: Australia (pre-filled)

3. **Additional Details:**
   - **Number of Positions** (how many people you're hiring)
   - **Application Deadline** (optional date)
   - **Closing Date** (when job closes)

4. **Choose Action:**
   - "Save as Draft" → Keep editing later
   - "Publish Job" → Make it live

**What happens when you Publish:**
- Job status changed to "published"
- Job appears in job seeker search results
- Publish date recorded
- Completion: 100%
- Redirected to success page

---

### 4. Managing Job Applications

#### **View Applications** (`/employer/job/[jobId]/applications`)

**What you see:**
- List of all candidates who applied
- Each application shows:
  - Candidate photo
  - Name
  - Current job title
  - Years of experience
  - Education level
  - Application status
  - Date applied
  - Resume/Cover letter (if provided)

**Application Actions:**
1. **Change Status:**
   - Pending → Reviewing
   - Reviewing → Shortlisted
   - Shortlisted → Interviewing
   - Interviewing → Accepted or Rejected

2. **Schedule Interview:**
   - Click "Schedule Interview"
   - Pick date/time
   - Enter location/meeting link
   - Candidate receives notification

3. **Message Candidate:**
   - Click "Message" to start chat
   - Discuss job details
   - Answer questions

4. **Accept/Reject:**
   - Click "Accept" → Offer job to candidate
   - Click "Reject" → Decline application

**What happens when you Accept:**
- Application status: Accepted
- Candidate notified
- Job can be marked as "Filled"

---

### 5. Employer Network Tab

#### **Tab 2: Networks**

**What you see:**
- Search bar to find employees
- List of all job seekers/employees on platform
- Each employee shows:
  - Profile photo
  - Name
  - Job title
  - Location
  - Experience level
  - Skills
  - Availability status
  - "Connect" button or "Message" button

**What you can do:**
1. **Search Employees:**
   - By name
   - By skills
   - By location
   - By industry

2. **Send Connection Request:**
   - Click "Connect" on employee profile
   - Write connection message
   - Request sent

3. **View Employee Profiles:**
   - Click on employee to see full profile
   - View work history
   - View availability
   - See portfolio/certifications

4. **Direct Messaging:**
   - If connected, click "Message"
   - Start direct conversation (permanent chat)
   - Discuss opportunities

**Connection Request Flow:**
1. You send connection request
2. Employee receives notification
3. They accept or reject
4. If accepted, they appear in your connections
5. You can now message them directly

---

### 6. Employer Messaging System

#### **Chat Types for Employers:**

**1. Application-Related Chats** 🔒
- Automatically created when applicant applies
- Tied to specific job
- Shows applicant's name and job title
- **You can Close the chat:**
  - Click "Close Chat" button
  - Chat becomes read-only for applicant
  - You can still send messages
  - Click "Reopen Chat" to allow replies

**2. Direct Messages** 📧
- Personal conversations with connections
- Not tied to any job
- Permanent (can't be closed)
- For networking and future opportunities

**What you see in Chat List:**
- All conversations sorted by recent activity
- Unread message badges
- Job title (for application chats)
- "Direct Message" label (for personal chats)
- "Closed" badge (if you closed it)

**Managing Chats:**
- Close job-related chats when position filled
- Keep direct messages for future hiring
- Refresh to see new messages
- Archive old conversations

---

### 7. Editing & Managing Jobs

#### **Edit Published Job**

**How to access:**
- Go to "My Jobs" tab
- Click on a published job
- Click "Edit Job" button

**What you can edit:**
- Job title
- Employment type
- Industry
- Salary range
- Job description
- Qualifications
- Location
- Closing date
- Number of positions

**What you CANNOT edit:**
- Job ID
- Created date
- Employer information
- Past applications

**What happens:**
- Changes saved immediately
- Job post updates for all viewers
- Current applicants not affected

---

#### **Close a Job**

**How to close:**
- Go to "My Jobs"
- Click on job
- Click "Close Job" button
- Confirm action

**What happens:**
- Status changed to "Closed"
- Job removed from search results
- No new applications accepted
- Existing applicants can still view
- All job-related chats become read-only
- Notification sent to applicants

---

#### **Delete a Job**

**How to delete:**
- Go to "My Jobs"
- Click on job
- Click "Delete Job" button
- Confirm deletion

**What happens:**
- Job permanently deleted from database
- All applications archived
- Chat history preserved but marked as deleted
- Cannot be undone

---

## Common Features (Both User Types)

### 1. Profile System

**Profile Visibility:**
- Profile photo
- Full name
- Contact info (controlled by privacy settings)
- Professional summary
- Work history
- Skills & certifications
- Availability
- Ratings & reviews

**Privacy Controls:**
- Show/hide email on profile
- Show/hide mobile number on profile
- Control who can message you
- Control who can see your profile

---

### 2. Notification System

**Notification Delivery:**
- **In-App:** Bell icon with badge count
- **Real-time:** Auto-refresh every 30 seconds
- **Persistent:** Notifications saved until deleted

**Notification Actions:**
- Click to navigate to relevant page
- Mark as read
- Delete notification
- Mark all as read

**Notification Types by User:**

**Job Seekers Receive:**
- Application status changes
- New message from employer
- Interview scheduled
- Job offer received
- Connection requests

**Employers Receive:**
- New application received
- Applicant message
- Application withdrawn
- Job closing soon reminder
- Connection accepted

---

### 3. Subscription System

**Payment Banner:**
- Appears if subscription inactive/expired
- Shows "Unlock Full Access" message
- "Subscribe Now" button
- Can be dismissed temporarily

**Subscription Features:**
**Free/Inactive:**
- Limited job views (2-3 dummy listings)
- Cannot apply to jobs
- Cannot create job postings
- Cannot message users
- View-only mode

**Active Subscription:**
- Unlimited job search
- Apply to unlimited jobs
- Create unlimited job postings
- Unlimited messaging
- Full network access
- Priority support

**Managing Subscription:**
- Click "Subscribe Now" in banner
- Redirected to Stripe payment
- After payment success, immediate access
- Status updates automatically

---

### 4. Authentication & Security

**Login Process:**
1. Go to `/login/role-selection`
2. Choose your role (Job Hunter or Head Hunter)
3. Enter email and password
4. Click "Log in"
5. Redirected to `/home`

**Password Requirements:**
- 8-15 characters
- Must include: uppercase, lowercase, number, special character
- Hashed with bcrypt (secure)

**Session Management:**
- JWT token stored in localStorage
- Token expires after period of inactivity
- Auto-logout on token expiration
- Manual logout available in menu

**Forgot Password:**
1. Click "Forgot your password?" on login
2. Enter email
3. Receive verification code
4. Enter code
5. Create new password
6. Login with new password

---

## Technical Flow Summary

### Database Architecture

**User Document Structure:**
```javascript
{
  // Authentication
  email: "user@example.com",
  password: "hashed_bcrypt_password",
  role: "employee" | "employer",
  
  // Basic Info
  fullName: "John Doe",
  mobileNumber: "+1234567890",
  
  // Personal Details (Job Seekers)
  personalDetails: {
    dateOfBirth: Date,
    address: "123 Main St",
    profileImage: "data:image/jpeg;base64,...",
    showEmailOnProfile: true,
    showMobileOnProfile: true
  },
  
  // Business Info (Employers)
  businessSummary: {
    companyName: "ABC Corp",
    companyLogo: "data:image/jpeg;base64,...",
    businessAddress: "456 Business Ave",
    businessPhone: "+1234567890",
    companyDescription: "...",
    industry: "Construction",
    companySize: "50-100"
  },
  
  // Professional Info
  personalSummary: {
    summary: "I am a skilled professional..."
  },
  
  workExperience: {
    workStatus: "currently-working",
    employmentTypes: ["full-time", "part-time"],
    industry: "Electrician",
    role: "Senior Electrician",
    yearsOfExperience: "5",
    highestEducation: "Bachelors",
    currentJobTitle: "Lead Electrician",
    currentCompany: "XYZ Electric",
    employmentDurationFrom: "2020-01",
    employmentDurationTo: "2025-11",
    workExperienceSummary: "Led electrical..."
  },
  
  availability: {
    preferredWorkTimes: ["morning", "afternoon"],
    dateRange: {
      from: Date,
      to: Date
    },
    noticePreference: "immediately"
  },
  
  // Subscription
  subscriptionStatus: "active" | "inactive" | "cancelled",
  subscriptionCustomerId: "cus_stripe_id",
  subscription: ObjectId(subscriptionDoc),
  
  // Onboarding Progress
  onboarding: {
    personalDetailsCompleted: true,
    personalSummaryCompleted: true,
    workExperienceCompleted: true,
    availabilityCompleted: true,
    completed: true,
    currentStep: 5
  },
  
  // Metadata
  isActive: true,
  isVerified: false,
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints

**Authentication:**
- `POST /api/auth/check-email` - Check if email exists
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user data
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

**Onboarding:**
- `POST /api/onboarding/personal-details` - Save personal info
- `POST /api/onboarding/personal-summary` - Save summary
- `POST /api/onboarding/work-experience` - Save work history
- `POST /api/onboarding/availability` - Save availability

**Jobs:**
- `GET /api/jobs/published/list` - Get all published jobs
- `POST /api/jobs/create` - Create new job (employer)
- `PUT /api/jobs/:id/job-details` - Update job details
- `PUT /api/jobs/:id/job-summary` - Update job summary
- `PUT /api/jobs/:id/qualifications` - Update qualifications
- `PUT /api/jobs/:id/post-job` - Update post job details
- `POST /api/jobs/:id/publish` - Publish job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/employer/:employerId` - Get employer's jobs
- `POST /api/jobs/:id/save` - Save job (job seeker)
- `POST /api/jobs/:id/unsave` - Unsave job
- `GET /api/jobs/saved/:userId` - Get saved jobs

**Applications:**
- `POST /api/applications/apply` - Submit application
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/job/:jobId` - Get job's applications
- `PUT /api/applications/:id/status` - Update application status
- `DELETE /api/applications/:id/withdraw` - Withdraw application
- `POST /api/applications/:id/schedule-interview` - Schedule interview

**Chats:**
- `GET /api/chats` - Get all user's chats
- `GET /api/chats/job/:jobId` - Get/create chat for job
- `GET /api/chats/job/:jobId/all` - Get all chats for job (employer)
- `GET /api/chats/direct/:userId` - Get/create direct chat
- `POST /api/chats/:id/message` - Send message
- `PUT /api/chats/:id/read` - Mark as read
- `POST /api/chats/:id/close` - Close chat (employer)
- `POST /api/chats/:id/reopen` - Reopen chat (employer)
- `POST /api/chats/:id/accept` - Accept chat request (employer)
- `DELETE /api/chats/:id` - Delete chat

**Connections:**
- `GET /api/connections` - Get user's connections
- `GET /api/connections/pending` - Get pending requests
- `GET /api/connections/employees` - Browse employees (employer)
- `POST /api/connections/request` - Send connection request
- `PUT /api/connections/:id/accept` - Accept request
- `PUT /api/connections/:id/reject` - Reject request

**Notifications:**
- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

**Payments:**
- `POST /api/stripe/create-checkout-session` - Create payment session
- `POST /api/stripe/webhook` - Handle Stripe events
- `POST /api/stripe/cancel-subscription` - Cancel subscription

---

## Key User Experience Features

### 1. **Progressive Onboarding**
- Step-by-step process
- Save & continue at any point
- Visual progress indicators
- Pre-filled data where possible
- Smart form validation

### 2. **Real-Time Updates**
- Messages auto-refresh (1.5s)
- Notifications poll every 30s
- Live typing indicators
- Instant status updates
- Badge counters

### 3. **Smart Navigation**
- Back button handling
- Deep linking (direct to chat/job)
- Breadcrumb trails
- Mobile-responsive sidebar

### 4. **Visual Feedback**
- Loading states
- Success/error messages
- Animated transitions
- Progress bars
- Status badges with colors

### 5. **Accessibility**
- Keyboard navigation
- Screen reader support
- High contrast mode (dark theme)
- Clear error messages
- Consistent UI patterns

### 6. **Data Security**
- Password hashing (bcrypt)
- JWT authentication
- HTTPS only
- Session timeout
- Privacy controls

---

## User Journey Summary

### Job Seeker Flow:
```
Signup → Pay → Onboard (4 steps) → Home Dashboard → 
→ Search Jobs → Apply → Chat → Interview → Get Hired
```

### Employer Flow:
```
Signup → Pay → Business Setup → Home Dashboard → 
→ Create Job → Review Applications → Chat → Interview → Hire
```

---

## Success Metrics for Users

**Job Seekers:**
- Profile completion: 100%
- Applications sent: Track count
- Response rate: % of applications replied to
- Interview rate: % of applications leading to interviews
- Hire rate: % of interviews leading to jobs

**Employers:**
- Jobs posted: Track count
- Application rate: Applications per job
- Quality of applicants: Based on qualifications match
- Time to hire: Days from post to hire
- Fill rate: % of positions filled

---

## Support & Help

**Getting Help:**
- FAQ section (coming soon)
- Support chat (coming soon)
- Email support: support@headhuntd.com
- Report issues in-app

**Common Issues:**
- Forgot password → Use reset flow
- Can't upload photo → Check file size (<5MB)
- Subscription issues → Contact support
- Chat not working → Refresh page
- Application stuck → Check job status

---

**Last Updated:** November 28, 2025  
**Version:** 1.0  
**Platform:** Web (Desktop & Mobile Responsive)
