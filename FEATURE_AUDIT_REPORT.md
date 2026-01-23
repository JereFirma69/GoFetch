# GoFetch Feature Audit Report
**Generated:** Jan 23, 2026 | **Focus:** Appointments & Connected Features

---

## Executive Summary
The appointments/booking feature is **functionally complete for core operations** (create, view, cancel bookings). However, several dependent features are **partially implemented or broken**, particularly around payments, notifications, reviews, and storage. The system also has deployment-blocking issues with email and image uploads.

---

## 1. ✅ FULLY WORKING FEATURES

### 1.1 Authentication & Authorization
**Status:** ✅ Fully Implemented  
**Files:** 
- Backend: [PawPal.Api/Services/Implementations/AuthService.cs](PawPal.Api/Services/Implementations/AuthService.cs)
- Backend: [PawPal.Api/Controllers/AuthController.cs](PawPal.Api/Controllers/AuthController.cs)

**What Works:**
- Registration with email/password
- Login with JWT tokens
- OAuth 2.0 Google Sign-In
- Password reset with email link
- Role registration (owner, walker, admin)
- Multi-role accounts (can have both owner + walker roles)
- Refresh token management
- Role removal

**Issues:** None identified

---

### 1.2 Appointments/Bookings - Core Functionality
**Status:** ✅ Fully Implemented & Recently Fixed  
**Files:**
- Frontend: [IzvorniKod/Frontend/src/pages/MyBookingsPage.jsx](IzvorniKod/Frontend/src/pages/MyBookingsPage.jsx)
- Frontend: [IzvorniKod/Frontend/src/shared_components/BookingModal.jsx](IzvorniKod/Frontend/src/shared_components/BookingModal.jsx)
- Frontend: [IzvorniKod/Frontend/src/pages/SearchPage.jsx](IzvorniKod/Frontend/src/pages/SearchPage.jsx)
- Backend: [PawPal.Api/Services/Implementations/CalendarService.cs](PawPal.Api/Services/Implementations/CalendarService.cs)
- Backend: [PawPal.Api/Controllers/CalendarController.cs](PawPal.Api/Controllers/CalendarController.cs)

**What Works:**
- ✅ Create bookings with dog selection, address, notes
- ✅ Owner views "Owner" tab → sees bookings they created
- ✅ Walker views "Walker" tab → sees incoming bookings to confirm/reject
- ✅ Multi-role accounts see BOTH owner + walker bookings (recently fixed!)
- ✅ 24-hour cancellation enforcement (hard-coded backend validation)
- ✅ Status tracking: "na cekanju", "prihvacena", "otkazana"
- ✅ Duration parsing (converts TimeSpan strings like "00:45:00" to minutes)
- ✅ Dog multi-select validation
- ✅ Payment record creation (Placanje model)
- ✅ Booking visible immediately after creation

**Recent Fix (Jan 23, 2026):**
- Changed `GetUserRezervacijeAsync()` from if/else logic to union both owner + walker queries
- Multi-role accounts now see both their owner bookings AND walker incoming bookings
- Bug report: "person who it's booked to doesn't see it" → RESOLVED

**Next Iteration Ready:** Cancel reason capture, booking history/analytics

---

### 1.3 Walker Discovery & Search
**Status:** ✅ Fully Implemented  
**Files:**
- Frontend: [IzvorniKod/Frontend/src/pages/SearchPage.jsx](IzvorniKod/Frontend/src/pages/SearchPage.jsx)
- Backend: [PawPal.Api/Services/Implementations/SearchService.cs](PawPal.Api/Services/Implementations/SearchService.cs)

**What Works:**
- Search walkers by location, price, walk type
- Display available slots with duration/location
- Integration with BookingModal for booking workflow
- Pagination support

**Issues:** None identified

---

### 1.4 Dog Management
**Status:** ✅ Fully Implemented  
**Files:**
- Backend: [PawPal.Api/Services/Implementations/ProfileService.cs](PawPal.Api/Services/Implementations/ProfileService.cs) → `CreateDogAsync()`, `UpdateDogAsync()`, `DeleteDogAsync()`

**What Works:**
- Create dogs with breed, health notes
- Multi-dog support per owner
- Dog selection in booking modal

**Issues:** Profile pictures fail to upload (Supabase bucket error - see section 7.1)

---

### 1.5 Admin Verification
**Status:** ✅ Fully Implemented  
**Files:**
- Frontend: [IzvorniKod/Frontend/src/pages/AdminPage.jsx](IzvorniKod/Frontend/src/pages/AdminPage.jsx)
- Backend: [PawPal.Api/Services/Implementations/AdminService.cs](PawPal.Api/Services/Implementations/AdminService.cs)

**What Works:**
- Admin dashboard for walker verification
- Approve/reject walkers
- View membership pricing
- Search users by role

**Issues:** 
- ❌ No booking management in admin panel (cannot view/manage all bookings)
- ❌ No admin actions tied to bookings

---

### 1.6 Google Calendar Integration
**Status:** ✅ Infrastructure Complete, **Integration Incomplete**  
**Files:**
- Backend: [PawPal.Api/Services/Implementations/GoogleCalendarService.cs](PawPal.Api/Services/Implementations/GoogleCalendarService.cs)
- Backend: [PawPal.Api/Controllers/CalendarController.cs](PawPal.Api/Controllers/CalendarController.cs)

**What Works:**
- OAuth 2.0 flow to connect Google Calendar
- `CreateEventAsync()` method exists
- `UpdateEventAsync()` method exists
- `DeleteEventAsync()` method exists
- `UpdateEventWithBookingAsync()` for syncing bookings to calendar

**Issues:**
- ❌ **NOT INTEGRATED:** Event creation is NOT called when booking is created
- ❌ **NOT INTEGRATED:** Event updates are NOT called when booking status changes
- ❌ **NOT TESTED:** Calendar sync flow never executed in practice
- ⚠️ Code smell: `CalendarService.cs` line 629 has TODO comment about calculating average rating

**Action Required:** Add trigger in `CreateRezervacijaAsync()` to create calendar event

---

---

## 2. 🟡 PARTIALLY WORKING FEATURES

### 2.1 Reviews & Ratings
**Status:** 🟡 Data Model Exists, **UI Not Integrated**  
**Files:**
- Model: [PawPal.Api/Models/Recenzija.cs](PawPal.Api/Models/Recenzija.cs)
- Frontend: [IzvorniKod/Frontend/src/components/reviews/LeaveReviewModal.jsx](IzvorniKod/Frontend/src/components/reviews/LeaveReviewModal.jsx)
- Frontend: [IzvorniKod/Frontend/src/components/reviews/ReviewsContext.jsx](IzvorniKod/Frontend/src/components/reviews/ReviewsContext.jsx)
- Backend: [PawPal.Api/Services/Implementations/SearchService.cs](PawPal.Api/Services/Implementations/SearchService.cs) → `GetWalkerReviewsAsync()`

**What Works:**
- Recenzija model has IdRecenzija, DatumRecenzija, Ocjena (1-5), Komentar, FotografijaRecenzija
- Connected to Rezervacija (booking ID)
- `GetWalkerReviewsAsync()` fetches reviews for walker profile
- LeaveReviewModal UI component exists with star rating

**What's Missing:**
- ❌ **NO BACKEND ENDPOINT** to CREATE/POST reviews (`POST /calendar/reviews`)
- ❌ **NO BACKEND ENDPOINT** to DELETE reviews
- ❌ LeaveReviewModal has `submitReview()` function but it's not connected to API
- ❌ No trigger to show review modal after booking completion
- ❌ ReviewsContext exists but not wired to actual API calls
- ❌ Reviews not displayed in booking cards
- ❌ Average rating calculation exists as TODO comment (line 629 in CalendarService)

**Action Required:**
1. Implement `POST /calendar/reviews` endpoint to create reviews
2. Connect LeaveReviewModal to backend API
3. Add trigger to show modal when booking status = "completed"
4. Display reviews on walker cards in SearchPage
5. Calculate average rating from reviews

---

### 2.2 Chat/Messaging System
**Status:** 🟡 Basic Infrastructure Exists, **Booking Integration Missing**  
**Files:**
- Frontend: [IzvorniKod/Frontend/src/components/ChatWidget.jsx](IzvorniKod/Frontend/src/components/ChatWidget.jsx)
- Frontend: [IzvorniKod/Frontend/src/components/chat/ChatContext.jsx](IzvorniKod/Frontend/src/components/chat/ChatContext.jsx)
- Backend: [PawPal.Api/Controllers/ChatController.cs](PawPal.Api/Controllers/ChatController.cs)
- Models: [PawPal.Api/Models/Poruka.cs](PawPal.Api/Models/Poruka.cs)

**What Works:**
- PopupSmart widget for general support chat (embedded in app)
- ChatController with `GetChatToken()` endpoint (Stream Chat integration)
- Message model (Poruka) with text, timestamp, photo

**What's Missing:**
- ❌ ChatWidget is **support-only**, not integrated with bookings
- ❌ No booking-specific messaging UI
- ❌ Stream Chat is initialized but not used for user-to-user messaging
- ❌ No "message walker" button in booking cards
- ❌ No conversation history tied to booking

**Current State:** Chat infrastructure exists but completely disconnected from booking workflow

**Action Required:**
1. Create booking-specific chat room (owner + walker for each booking)
2. Display "Message" button in booking cards
3. Open chat room with booking context
4. Show conversation history in booking details

---

### 2.3 Payment Processing
**Status:** 🟡 Data Model Complete, **Gateway Not Implemented**  
**Files:**
- Model: [PawPal.Api/Models/Placanje.cs](PawPal.Api/Models/Placanje.cs)
- Backend: [PawPal.Api/Services/Implementations/CalendarService.cs](PawPal.Api/Services/Implementations/CalendarService.cs) → `CreateRezervacijaAsync()` line ~300

**What Works:**
- Placanje record is created when booking is made
- Stores: IdPlacanja, DatumPlacanja, IznosPlacanja, NacinPlacanja, StatusPlacanja
- NacinPlacanja supports: "gotovina", "paypal", "kartica"
- StatusPlacanja defaults to "na cekanju"

**What's Missing:**
- ❌ **HARDCODED TO PAYPAL:** No actual payment processing
- ❌ **NO PAYMENT GATEWAY:** Stripe/PayPal integration missing
- ❌ **NO PAYMENT CONFIRMATION:** Frontend never directs to payment page
- ❌ **NO PAYMENT STATUS UPDATE:** Payment status never changes from "na cekanju"
- ❌ **NO PAYMENT VALIDATION:** Booking confirmed without payment verification

**Current Implementation (CalendarService.cs ~300):**
```csharp
var placanje = new Placanje
{
    IznosPlacanja = termin.Cijena,
    NacinPlacanja = request.NacinPlacanja, // User submitted, but...
    StatusPlacanja = "na cekanju", // Hardcoded, never updated
    DatumPlacanja = DateTime.UtcNow
};
```

**Action Required:**
1. **CRITICAL:** Integrate Stripe/PayPal API
2. Redirect to payment page before booking confirmation
3. Implement webhook to update payment status
4. Block booking confirmation until payment succeeds
5. Send payment receipt email

---

### 2.4 Email Notifications
**Status:** 🟡 Service Configured, **Domain Not Verified**  
**Files:**
- Backend: [PawPal.Api/Services/Implementations/EmailService.cs](PawPal.Api/Services/Implementations/EmailService.cs)
- Configuration: [PawPal.Api/appsettings.json](PawPal.Api/appsettings.json)

**What Works:**
- EmailService has `SendPasswordResetEmailAsync()` (used for password resets)
- Azure Communication Services client initialized
- HTML email template for password reset exists

**What's Missing:**
- ❌ **Azure domain not linked:** FromEmail not configured per logs
- ❌ **NO BOOKING EMAILS:** No email on booking creation
- ❌ **NO STATUS CHANGE EMAILS:** No email when walker confirms/rejects
- ❌ **NO RECEIPT EMAILS:** No payment confirmation email
- ⚠️ **FALLBACK MODE:** EmailService logs emails instead of sending when not configured

**Current State:** 
```
Provider=AzureCommunicationServices
HasConnectionString=true
FromEmail=(not configured)
```

**Action Required:**
1. **CRITICAL:** Link Azure Communication Services verified domain
2. Configure `FromEmail` to verified domain email
3. Add `SendBookingConfirmationEmailAsync()`
4. Add `SendBookingStatusChangeEmailAsync()`
5. Add `SendPaymentReceiptEmailAsync()`
6. Call these methods from booking workflow

---

### 2.5 Image Upload & Storage
**Status:** 🟡 Service Implemented, **Buckets Have Issues**  
**Files:**
- Backend: [PawPal.Api/Services/Implementations/StorageService.cs](PawPal.Api/Services/Implementations/StorageService.cs)
- Controller: [PawPal.Api/Controllers/UploadController.cs](PawPal.Api/Controllers/UploadController.cs)

**Infrastructure:**
- Supabase integration present
- Two buckets configured: "Avatar", "DogPhotos"
- Path structure: `{userId}/avatar{ext}` and `{ownerId}/{dogId}{ext}`

**Issues (from logs):**
- ❌ **Bucket not found errors** on image upload attempts
- ❌ **Supabase bucket misconfigured or deleted**
- ⚠️ Users cannot upload profile pictures
- ⚠️ Users cannot upload dog photos

**Current Endpoints:**
- `POST /upload/avatar` → `UploadController.cs` line 34
- `POST /upload/dog-image/{dogId}` → `UploadController.cs` line 81

**Action Required:**
1. Verify Supabase project URL and service role key
2. Recreate "Avatar" bucket if deleted
3. Recreate "DogPhotos" bucket if deleted
4. Set bucket visibility to public
5. Test upload flow end-to-end
6. Monitor error logs for confirmation

---

---

## 3. ❌ NOT IMPLEMENTED / BROKEN FEATURES

### 3.1 Real-Time Notifications
**Status:** ❌ Not Implemented  
**Why:** No WebSocket/SignalR integration, no push notifications

**Missing:**
- Real-time notification when booking request arrives
- Real-time status update when walker confirms
- Real-time cancellation notification
- In-app notification bell/toast for booking events
- Push notifications to mobile (if mobile app exists)

**Files That Need to Be Created:**
- `PawPal.Api/Hubs/NotificationHub.cs` (SignalR hub)
- `IzvorniKod/Frontend/src/hooks/useNotifications.js`
- Database table: Notifikacija (not in current schema)

**Action Required:**
1. Add SignalR hub for real-time events
2. Broadcast booking events to relevant users
3. Store notifications in database
4. Display notification UI in frontend
5. Mark as read/clear functionality

---

### 3.2 Booking History & Analytics
**Status:** ❌ Not Implemented  
**Why:** No analytics queries, no history view

**Missing:**
- Total bookings count per walker
- Monthly earnings for walker
- Booking completion rate
- Walker performance metrics
- Owner booking history with filters
- Export booking data

**Action Required:**
1. Add analytics queries to CalendarService
2. Create analytics endpoint (`GET /calendar/analytics/walker`)
3. Create history view in frontend
4. Dashboard showing stats

---

### 3.3 Cancellation Reason Capture
**Status:** ❌ Not Implemented  
**Why:** No reason field in cancellation flow

**Missing:**
- Cancel button shows modal to capture reason
- Reason saved to database
- Cancellation notification includes reason
- Admin can view cancellation statistics

**Files Missing:**
- `Rezervacija.cs` → Add `RazlogOtkazivanja` field

**Action Required:**
1. Add reason field to Rezervacija model
2. Create migration
3. Add reason input to cancel modal
4. Save reason when canceling

---

### 3.4 Admin Booking Management
**Status:** ❌ Not Implemented  
**Why:** Admin panel has no booking section

**Missing:**
- View all bookings (with filters by status, date, walker)
- View booking details
- Manual status changes
- Dispute resolution UI
- Refund processing

**Files Missing:**
- Add bookings section to [IzvorniKod/Frontend/src/pages/AdminPage.jsx](IzvorniKod/Frontend/src/pages/AdminPage.jsx)

**Action Required:**
1. Add admin bookings endpoint: `GET /admin/bookings`
2. Add booking management UI
3. Add filter/search
4. Add dispute handling

---

### 3.5 Payment Receipts & History
**Status:** ❌ Not Implemented  
**Why:** Payment status never changes, no receipt generation

**Missing:**
- View payment history
- Download receipt (PDF)
- Payment status tracking
- Refund history
- Retry failed payments

**Action Required:**
1. Complete payment gateway integration (see 2.3)
2. Add receipt generation
3. Create payment history UI
4. Add refund endpoint

---

### 3.6 Walker Availability Calendar Display
**Status:** ❌ Not Implemented  
**Why:** No calendar UI for owners to see walker availability

**Missing:**
- Calendar view of walker's available slots
- Visual indication of booked vs available
- Drag-to-book functionality
- Conflict detection

**Action Required:**
1. Add calendar component to walker profile
2. Fetch available termini for date range
3. Display bookings and availability
4. Show real-time availability updates

---

### 3.7 Review/Rating Display in Booking Cards
**Status:** ❌ Not Implemented  
**Why:** Reviews exist but not fetched/displayed

**Missing:**
- Star rating display in BookingCard
- Review count badge
- Recent reviews preview in card

**Action Required:**
1. Fetch walker reviews when loading booking
2. Display average rating in card
3. Show "1,250 reviews" badge
4. Add click-to-expand reviews

---

### 3.8 Two-Way Review System
**Status:** ❌ Not Implemented  
**Why:** Only walker reviews exist, owner can't be reviewed

**Missing:**
- Walker can leave review for owner
- Owner can leave review for walker
- Mutual review visibility
- Review moderation (admin)

**Database:** Need to track reviewer role and recipient role

**Action Required:**
1. Modify Recenzija model to support bidirectional reviews
2. Create separate endpoints for posting reviews
3. Add role-based access control
4. Display reviews differently for owner vs walker

---

---

## 4. 🔴 CRITICAL BLOCKERS

### 4.1 Azure Email Service Not Configured
**Impact:** Password resets work, but **all booking emails will fail silently**  
**Blocker:** Domain not linked to Azure Communication Services  
**Resolution:** Link verified domain in Azure Portal

### 4.2 Supabase Buckets Not Accessible
**Impact:** Users cannot upload profile pictures or dog photos  
**Blocker:** "Avatar" and "DogPhotos" buckets not found  
**Resolution:** Recreate buckets and verify permissions

### 4.3 Payment Gateway Not Integrated
**Impact:** Bookings created without actual payment processing  
**Blocker:** Hardcoded to "paypal", no real payment flow  
**Resolution:** Integrate Stripe or PayPal SDK

### 4.4 Google Calendar Not Wired to Bookings
**Impact:** Calendar events not created when bookings made  
**Blocker:** Integration code exists but never called  
**Resolution:** Add event creation trigger in booking flow

---

---

## 5. PRIORITY ACTION PLAN

### Phase 1: Fix Critical Blockers (Next Sprint)
**Est. Time: 1-2 weeks**

1. **Fix Azure Email** (1-2 days)
   - Link domain to Azure Communication Services
   - Add booking notification emails
   - Test end-to-end

2. **Fix Supabase Buckets** (1 day)
   - Recreate buckets
   - Verify CORS/permissions
   - Test file upload

3. **Implement Payment Gateway** (3-5 days)
   - Choose: Stripe vs PayPal
   - Integrate SDK
   - Add webhook handlers
   - Test payment flow

### Phase 2: Connect Dependent Features (2-3 weeks)

1. **Calendar Integration** (2-3 days)
   - Add event creation on booking
   - Add event update on status change
   - Test sync

2. **Reviews System** (2-3 days)
   - Create POST endpoint
   - Connect LeaveReviewModal
   - Display ratings in cards

3. **Real-Time Notifications** (3-5 days)
   - Add SignalR hub
   - Implement notification broadcasts
   - Add UI toast notifications

### Phase 3: Polish & Analytics (1-2 weeks)

1. **Booking History & Analytics**
2. **Admin Booking Management**
3. **Cancellation Reason Capture**
4. **Payment History & Receipts**

---

## 6. FEATURE CHECKLIST

```
Core Booking System:
  ✅ Create booking
  ✅ View bookings (owner/walker)
  ✅ Cancel booking
  ✅ Multi-role support
  ✅ 24-hour cancellation block
  ❌ Booking notifications
  ❌ Booking history
  
Related Features:
  ✅ Walker search
  ✅ Dog management
  ✅ Admin verification
  ❌ Payment processing (critical)
  ❌ Email notifications (critical)
  ❌ Image uploads (critical)
  ❌ Calendar sync
  ❌ Reviews integration
  ❌ Chat integration
  ❌ Notifications (real-time)

Admin:
  ✅ Walker verification
  ❌ Booking management
  ❌ Dispute resolution
```

---

## 7. FILE STRUCTURE REFERENCE

### Backend DTOs
- [PawPal.Api/DTOs/CalendarDtos.cs](PawPal.Api/DTOs/CalendarDtos.cs) - Booking/Termin DTOs
- [PawPal.Api/DTOs/AdminDtos.cs](PawPal.Api/DTOs/AdminDtos.cs) - Review DTO exists but no creation endpoint

### Backend Models
- [PawPal.Api/Models/Rezervacija.cs](PawPal.Api/Models/Rezervacija.cs) - Booking
- [PawPal.Api/Models/Placanje.cs](PawPal.Api/Models/Placanje.cs) - Payment
- [PawPal.Api/Models/Recenzija.cs](PawPal.Api/Models/Recenzija.cs) - Review
- [PawPal.Api/Models/Poruka.cs](PawPal.Api/Models/Poruka.cs) - Message
- [PawPal.Api/Models/Termin.cs](PawPal.Api/Models/Termin.cs) - Appointment slot

### Frontend Pages
- [IzvorniKod/Frontend/src/pages/MyBookingsPage.jsx](IzvorniKod/Frontend/src/pages/MyBookingsPage.jsx) - Main booking dashboard
- [IzvorniKod/Frontend/src/pages/SearchPage.jsx](IzvorniKod/Frontend/src/pages/SearchPage.jsx) - Search/discovery
- [IzvorniKod/Frontend/src/pages/ProfilePage.jsx](IzvorniKod/Frontend/src/pages/ProfilePage.jsx) - User profile

### Frontend Components
- [IzvorniKod/Frontend/src/shared_components/BookingModal.jsx](IzvorniKod/Frontend/src/shared_components/BookingModal.jsx) - Booking form
- [IzvorniKod/Frontend/src/components/reviews/LeaveReviewModal.jsx](IzvorniKod/Frontend/src/components/reviews/LeaveReviewModal.jsx) - Review form (not wired)

---

## 8. NEXT STEPS

1. **Immediate (Today):** Review this report with team, prioritize blockers
2. **This Week:** Fix Azure email + Supabase buckets
3. **Next Sprint:** Payment gateway integration + calendar sync
4. **Following Sprint:** Reviews + notifications

---

**Report compiled from:** Full codebase scan, recent commits, error logs, conversation history  
**Last test:** Jan 23, 2026 - Booking creation and multi-role visibility working  
**Known issues:** Payment gateway hardcoded, email not configured, image uploads failing
