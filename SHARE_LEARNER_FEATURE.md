# Share Learner Feature Documentation

## Overview
The Share Learner feature allows mentors to grant access to their learners to other users by email. This enables collaborative mentoring where multiple mentors can work with the same learner.

## How It Works

### For Mentors Sharing Access
1. **Navigate to a learner's detail page** - Click on any learner card from your mentors dashboard
2. **Click the "Share" button** - Located in the action buttons at the top of the learner page
3. **Enter the email address** - Type the email of the person you want to share with
4. **Click "Share Learner"** - The system will check if a user exists with that email

### Requirements
- The target user must already have a Banerry account with the provided email
- You must be an existing mentor for the learner
- Cannot share with yourself
- Cannot share with someone who already has access

### Mentor Management
- **View all mentors** - A mentors list is displayed on the learner detail page showing all users with access
- **Remove mentor access** - Click the X button next to any mentor to remove their access
- **Protection** - Cannot remove the last mentor (yourself) to prevent orphaned learners

## Technical Implementation

### Database Schema
Uses the existing `learnerMentorRelationships` table:
- `learnerId`: Reference to the learner
- `mentorId`: Reference to the user/mentor
- Multiple relationships can exist for the same learner

### Backend Functions (convex/learners.ts)

#### `share(learnerId, email)`
- Validates the current user has access to the learner
- Looks up the target user by email
- Creates a new mentor relationship if valid
- Returns success/failure with appropriate messages

#### `getMentors(learnerId)`
- Returns list of all mentors for a learner
- Includes user details (name, email)
- Requires existing mentor access

#### `removeMentor(learnerId, mentorId)`
- Removes mentor access for a user
- Prevents removing the last mentor
- Returns success/failure status

### Frontend Components

#### ShareLearnerForm
- Modal dialog for entering email
- Real-time validation
- Toast notifications for feedback
- Located in `app/mentor/share-learner-form.tsx`

#### MentorsList
- Displays all mentors with their details
- Remove functionality with confirmation
- Located in `app/mentor/mentors-list.tsx`

## Error Handling
- **User not found**: "No user found with that email address. They need to sign up first."
- **Already has access**: "This user already has access to this learner."
- **Self-sharing**: "You already have access to this learner."
- **Last mentor removal**: "Cannot remove yourself - you are the only mentor for this learner."

## UI/UX Features
- Responsive design with proper spacing
- Clear visual feedback with toast notifications
- Confirmation dialogs for destructive actions
- Loading states during async operations
- Accessible form controls and labels

## Future Enhancements
- Email invitations for non-existing users
- Role-based permissions (view-only vs full access)
- Bulk sharing to multiple users
- Activity logging for sharing actions