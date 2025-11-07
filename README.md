# Quick Start Guide - User Registration & Role Assignment Flow

## 🚀 Setup & Deployment

### 1. Deploy Cloud Functions

```bash
cd functions
npm install
firebase deploy --only functions:manageUserCustomClaims
```

### 2. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Frontend Setup

```bash
npm install
npm run dev  # For development
# or
npm run build && firebase deploy --only hosting  # For production
```

## 📋 Quick Test Flow

### Test New User Registration

1. **Sign Up:**
   - Go to `http://localhost:5173/signup`
   - Fill in the form with test data
   - Submit

2. **Verify:**
   - User should be redirected to `/pending-approval`
   - Check Firebase Console → Firestore → users collection
   - User document should have:
     ```json
     {
       "status": "pending",
       "role": "",
       "profileComplete": true
     }
     ```

3. **Approve User:**
   - Login as superuser
   - Go to `/users` page
   - Find the pending user
   - Click "Approve" button
   - Select a role from the modal
   - Click "Approve User"

4. **Verify Approval:**
   - Check Firebase Console → Firestore → users
   - User should now have:
     ```json
     {
       "status": "active",
       "role": "selected_role_id"
     }
     ```
   - Check Firebase Console → Authentication → Users → Custom Claims
   - User should have custom claims set

5. **User Experience:**
   - The pending user should see a toast notification
   - Should be automatically redirected to dashboard
   - Should have access based on assigned role

### Test Google OAuth

1. **Sign in with Google:**
   - Go to `/login`
   - Click "Sign in with Google"
   - Complete Google authentication

2. **Complete Profile:**
   - If new user, redirected to `/update-profile`
   - Fill in: Phone, Office, Department
   - Submit

3. **Follow approval steps** from step 3 above

## 🔑 Key Components to Check

### 1. Custom Claims (After Approval)

Open browser console on approved user:

```javascript
firebase.auth().currentUser.getIdTokenResult()
  .then(token => {
    console.log('Custom Claims:', token.claims);
    // Should show:
    // {
    //   role: "sales_manager_mumbai",
    //   roleLevel: 6,
    //   officeId: "mumbai",
    //   departmentId: "sales",
    //   isGlobal: false
    // }
  });
```

### 2. Redux Store (In App)

Open Redux DevTools:

```javascript
// Check state.user
{
  status: true,
  userData: { /* user data */ },
  permissions: { /* permissions map */ },
  customClaims: { /* custom claims */ }
}
```

### 3. Permissions Usage in Components

```jsx
import { useSelector } from 'react-redux';
import { selectPermissions } from '../features/user/userSlice';
import { hasPermission } from '../assets/permissionUtils';

function MyComponent() {
  const permissions = useSelector(selectPermissions);
  
  // Check permission
  if (hasPermission(permissions, 'pi_create')) {
    return <CreateButton />;
  }
  
  return null;
}
```

## 🐛 Common Issues & Fixes

### Issue: User approved but not redirected

**Check:**
1. Open browser console - any errors?
2. Check Network tab - is token refreshing?
3. Verify Cloud Function executed (Firebase Console → Functions → Logs)

**Fix:**
```javascript
// Manually refresh token
import authService from './firebase/auth';
await authService.refreshToken(true);
```

### Issue: Permissions not loading

**Check:**
1. Does the role exist in Firestore?
2. Does the role have permissions assigned?
3. Check Redux DevTools - is permissions object populated?

**Fix:**
```javascript
// Manually refresh permissions
import authService from './firebase/auth';
const perms = await authService.refreshPermissions(uid);
console.log('Permissions:', perms);
```

### Issue: Custom claims not set

**Check Firebase Console:**
1. Functions → Logs → Look for `manageUserCustomClaims` execution
2. Authentication → Users → Click user → Custom Claims tab

**Debug:**
```bash
# Check function logs
firebase functions:log --only manageUserCustomClaims
```

## 📊 Monitoring

### Cloud Function Execution

```bash
# View recent logs
firebase functions:log

# View specific function
firebase functions:log --only manageUserCustomClaims

# Follow logs in real-time
firebase functions:log --only manageUserCustomClaims --tail
```

### Firestore Security Rules Debugging

Enable debug mode in Firebase Console:
1. Go to Firestore → Rules
2. Add debug statements:
   ```javascript
   allow read: if debug(request.auth.token.role) && hasRole();
   ```

## 🎯 Permission Examples

### Create Role with Permissions

```javascript
import roleService from './firebase/roles';

const newRole = {
  roleId: 'sales_manager_mumbai',
  roleName: 'Sales Manager - Mumbai',
  level: 6,
  officeId: 'mumbai',
  departmentId: 'sales',
  isGlobal: false,
  permissions: {
    'pi_create': true,
    'pi_read': true,
    'pi_update': true,
    'pi_delete': false,
    'pi_approve_level_1': true,
    'pi_approve_level_2': true,
    'booking_create': true,
    'booking_read': true,
    'booking_update': true,
  }
};

await roleService.createRole(newRole);
```

### Check Permissions in Component

```jsx
import { useSelector } from 'react-redux';
import { selectPermissions, selectCustomClaims } from '../features/user/userSlice';
import { 
  hasPermission, 
  canApproveAtLevel, 
  isSuperuser 
} from '../assets/permissionUtils';

function SalesComponent() {
  const permissions = useSelector(selectPermissions);
  const customClaims = useSelector(selectCustomClaims);
  
  const canCreatePI = hasPermission(permissions, 'pi_create');
  const canApproveLevel2 = canApproveAtLevel(permissions, 'pi', 2);
  const isSuper = isSuperuser(customClaims);
  
  return (
    <div>
      {canCreatePI && <CreatePIButton />}
      {canApproveLevel2 && <ApprovePIButton level={2} />}
      {isSuper && <AdminPanel />}
    </div>
  );
}
```

## 📚 Next Steps

1. **Read Full Documentation:**
   - `IMPLEMENTATION_GUIDE.md` - Complete implementation details
   - `CHANGES_SUMMARY.md` - All changes made

2. **Test Thoroughly:**
   - Test all user flows
   - Test all permission checks
   - Test security rules

3. **Deploy to Production:**
   ```bash
   # Deploy everything
   firebase deploy
   
   # Or deploy individually
   firebase deploy --only functions
   firebase deploy --only firestore:rules
   firebase deploy --only hosting
   ```

4. **Monitor:**
   - Watch Cloud Function logs
   - Monitor user registrations
   - Check for security rule violations

## 🆘 Support

- **Documentation:** See `IMPLEMENTATION_GUIDE.md`
- **Changes:** See `CHANGES_SUMMARY.md`
- **Issues:** Check troubleshooting section in implementation guide

## ✅ Checklist for Production

- [ ] All Cloud Functions deployed
- [ ] Security rules deployed and tested
- [ ] Frontend deployed
- [ ] At least one superuser account exists
- [ ] Test user registration flow
- [ ] Test approval flow
- [ ] Test permission checks
- [ ] Monitor Cloud Function costs
- [ ] Set up error monitoring
- [ ] Document custom permissions
- [ ] Train admins on approval process

---

**Version:** 1.0.0  
**Last Updated:** November 5, 2025
