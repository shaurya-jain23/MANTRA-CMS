export const convertTimestamps = (docData) => {
  if (!docData) {
    return null;
  }
  const data = { ...docData };
  for (const key in data) {
    if (data[key] && typeof data[key].seconds === 'number') {
      // then to a universal ISO string format (e.g., "2025-09-08T12:30:00.000Z").
      data[key] = new Date(data[key].seconds * 1000).toISOString();
    }
  }
  return data;
};

export const convertStringsToTimestamps = (docData) => {
  if (!docData) {
    return null;
  }
  const data = { ...docData };
  for (const key in data) {
    if (typeof data[key] === 'string' && data[key]) {
      // Check if the string is in ISO 8601 format
      const isoRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).*Z$/;
      if (isoRegex.test(data[key])) {
        const date = new Date(data[key]);
        if (!isNaN(date.getTime())) {
          data[key] = date; // Convert the string back to a Date object
        }
      }
    }
  }
  return data;
};

export const getDefaultRouteForRole = function (role) {
  switch (role) {
    case 'sales':
      return '/sales';
    case 'admin':
    case 'superuser':
      return '/dashboard';
    case 'manager':
      return '/manager';
    case 'dispatch':
      return '/dispatch';
    case 'accounts':
      return '/accounts';
    default:
      return '/unauthorized';
  }
};

export const transformBookingToPI = (booking, container, dealer, userData) => {
  // Calculate totals based on booking data
  const pricePerPiece = booking.pricePerPiece || 0;
  const quantity = container?.qty || 0;
  const subtotal = pricePerPiece * quantity;

  // Calculate battery, charger, tyre amounts if included
  let extrasTotal = 0;
  if (booking.battery?.included && !booking.battery?.price_included) {
    extrasTotal += (booking.battery?.price || 0) * (booking.battery?.quantity || 0);
  }
  if (booking.charger?.included && !booking.charger?.price_included) {
    extrasTotal += (booking.charger?.price || 0) * (booking.charger?.quantity || 0);
  }

  const transportCharges = ['false', false].includes(booking.transport?.included)
    ? booking.transport?.charges || 0
    : 0;

  const grandTotal = subtotal + extrasTotal + transportCharges;
  const finalSubtotal = grandTotal * (100 / 105);
  const taxAmount = finalSubtotal * 0.05; // Assuming 5% tax

  let piStatus = 'unpaid';
  switch (booking?.payment?.status) {
    case 'Not Received':
      piStatus = 'unpaid';
      break;
    case 'Full Payment Received':
      piStatus = 'paid';
      break;
    case 'Partial Received':
      piStatus = 'partially';
      break;
    case 'Full Token Received':
    case 'Partial Token Received':
      piStatus = 'token';
      break;
    default:
      piStatus = 'unknown';
  }
  let deliveryTerms = 'after_10_days';
  switch (container?.status) {
    case 'At Sea':
      deliveryTerms = 'after_15_days';
      break;
    case 'Reached Port':
    case 'Clearance Pending':
      deliveryTerms = 'after_10_days';
      break;
    case 'At CFS':
    case 'DO Pending':
      deliveryTerms = 'after_5_days';
      break;
    default:
      deliveryTerms = 'after_10_days';
  }

  // Transform booking items to PI items format
  const items = [
    {
      model: container?.model?.toLowerCase() || 'single_light',
      qty: quantity,
      unit_price: pricePerPiece,
      description: {
        battery: booking.battery?.included ? booking.battery?.type : 'none',
        model: container?.specifications?.trim().replace(/\s+/g, '_').toLowerCase() || 'standard',
        charger: booking.charger?.included ? booking.charger?.type : 'none',
      },
      with_battery: (booking.battery?.included && booking.battery?.price_included) || false,
      with_charger: (booking.charger?.included && booking.charger?.price_included) || false,
      with_tyre: booking.tyre?.included || false,
      with_assembling: booking.assembling?.included || false,
    },
  ];

  if (booking.battery?.included && !booking.battery?.price_included) {
    const batteryItem = {
      model: 'battery',
      qty: booking.battery?.quantity,
      unit_price: booking.battery?.price,
      description: {
        model: booking.battery?.type.trim().replace(/\s+/g, '_').toLowerCase() || 'standard',
      },
    };
    items.push(batteryItem);
  }
  if (booking.charger?.included && !booking.charger?.price_included) {
    const chargerItem = {
      model: 'charger',
      qty: booking.charger?.quantity,
      unit_price: booking.charger?.price,
      description: {
        model: booking.charger?.type.trim().replace(/\s+/g, '_').toLowerCase() || 'standard',
      },
    };
    items.push(chargerItem);
  }

  return {
    bookingId: booking.id,
    placeOfDelivery: booking.placeOfDelivery,
    dealerId: booking.dealerId,
    generated_by_id: userData.uid,
    generated_by_name: booking.requested_by_name,
    status: piStatus,
    billing: {
      address: dealer?.address || '',
      firm: dealer?.trade_name || '',
      district: dealer?.district || '',
      gst_no: dealer?.gst_no || '',
      state: dealer?.state || '',
    },
    shipping: 'same_as_billing',
    same_as_billing: true,
    delivery_terms: deliveryTerms,
    transport: {
      charges: transportCharges,
      included: booking.transport?.included || false,
    },
    items: items,
    totals: {
      subTotal: finalSubtotal,
      taxAmount: taxAmount,
      grandTotal: grandTotal,
    },
    billing_remarks: booking.remarks || `Generated from booking ${booking.id}`,
    pi_date: new Date().toLocaleDateString('en-IN'),
    pi_number: '',
    createdAt: new Date().toISOString(),
  };
};

export const checkNetworkConnection = () => {
  return navigator.onLine;
};

export const getErrorMessage = (error) => {
  if (!checkNetworkConnection()) {
    return {
      message: 'Please check your internet connection and try again.',
      code: 'network/offline',
    };
  }

  switch (error.code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-email':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      // Don't specify whether email or password is wrong for security
      return {
        message: 'Invalid email or password. Please try again.',
        code: error.code,
      };
    case 'auth/user-disabled':
      return {
        message: 'This account has been disabled. Please contact support.',
        code: error.code,
      };
    case 'auth/user-mismatch':
      return {
        message: 'Invalid user authentication. Please login with correct credentials.',
        code: error.code,
      };
    case 'auth/email-already-in-use':
      return { message: 'An account with this email already exists.', code: error.code };
    case 'auth/weak-password':
      return {
        message: 'Password is too weak. Please use at least 6 characters.',
        code: error.code,
      };
    case 'auth/network-request-failed':
      return { message: 'Network error. Please check your internet connection.', code: error.code };
    case 'auth/too-many-requests':
      return {
        message: 'Too many unsuccessful attempts. Please try again later or reset your password.',
        code: error.code,
      };
    case 'auth/popup-closed-by-user':
      return { message: 'Sign-in was cancelled.', code: error.code };
    case 'auth/popup-blocked':
      return { message: 'Popup was blocked. Please allow popups for this site.', code: error.code };
    case 'auth/operation-not-allowed':
      return {
        message: 'Email/password sign-in is not enabled. Please contact support.',
        code: error.code,
      };
    case 'auth/unauthorized-domain':
      return { message: 'This domain is not authorized for authentication.', code: error.code };
    case 'auth/invalid-verification-code':
      return { message: 'The verification code is invalid.', code: error.code };
    case 'auth/invalid-verification-id':
      return { message: 'The verification ID is invalid.', code: error.code };
    default:
      // For any unhandled errors, provide a generic message
      console.error('Unhandled auth error:', error.code, error.message);
      return {
        message: 'Authentication failed. Please try again.',
        code: error.code || 'unknown',
      };
  }
};

import toast from 'react-hot-toast';
import { Info } from 'lucide-react';

export const customInfoToast = (message) => {
  toast.custom(
    (t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} toast-custom-style`}>
        <Info style={{ color: '#FFD700' }} />
        <span>{message}</span>
      </div>
    ),
    {
      id: 'reauth-toast',
      duration: '3000',
      removeDelay: '4000',
    }
  );
};

export const getColorScore = (colorString = '', type) => {
  const brightColors = ['RED', 'BLUE', 'GREEN'];
  const darkColors = ['BLACK', 'GREY', 'WHITE'];
  let score = 0;
  const colors = colorString
    .replace(/\s/g, '')
    .split(/[，, ;]/)
    .map((part) => {
      const [name, value] = part.trim().split('-');
      return {
        name: name.trim().toUpperCase(),
        value: parseInt(value, 10),
      };
    })
    .filter((color) => !isNaN(color.value) && color.value > 0);

  const total = colors.reduce((sum, color) => sum + color.value, 0);
  colors.forEach(({ name, value }) => {
    if (type === 'bright' && total > 0 && brightColors.includes(name)) {
      score += parseInt((value / total) * 100, 10);
    }
    if (type === 'dark' && total > 0 && darkColors.includes(name)) {
      score += parseInt((value / total) * 100);
    }
  });
  console.log(colorString, score);
  return score;
};

export const getSalesApprovalChain = (creatorRole) => {
  const chain = [];
  if (creatorRole === 'sales') {
    chain.push(
      {
        role: 'sales_manager',
        status: 'pending',
        order: 1,
        timestamp: null,
        comments: '',
        approved_by: null,
      },
      {
        role: 'admin',
        status: 'pending',
        order: 2,
        timestamp: null,
        comments: '',
        approved_by: null,
      }
    );
  } else if (creatorRole === 'admin' || creatorRole === 'sales_manager') {
    chain.push({
      role: 'admin',
      status: 'pending',
      order: 1,
      timestamp: null,
      comments: '',
      approved_by: null,
    });
  }
  // superuser doesn't need approval chain

  return chain;
};

// Helper method to update approval chain
export const updateApprovalChain = (chain, role, action, comments = '') => {
  return chain.map((step) => {
    if (step.role === role && step.status === 'pending') {
      return {
        ...step,
        status: action,
        timestamp: new Date(),
        comments: comments,
        approved_by: action === 'approved' ? 'current_user_id' : null, // TODO: Get current user
      };
    }
    return step;
  });
};
/*
export const getStatusFromApprovalChain = (approvalChain) => {
  if (!approvalChain || approvalChain.length === 0) {
    return PI_STATUS.APPROVED_BY_ADMIN;
  }

  // Sort by order
  const sortedChain = [...approvalChain].sort((a, b) => a.order - b.order);

  // Check for any rejections first
  const rejectedStep = sortedChain.find(step => step.status === 'rejected');
  if (rejectedStep) {
    return PI_STATUS.REJECTED;
  }
  // Find the first pending step
  const firstPendingStep = sortedChain.find((step) => step.status === 'pending');

  if (firstPendingStep) {
    // There are still pending approvals
    switch (firstPendingStep.order) {
      case 1:
        return PI_STATUS.SUBMITTED; // Still at first level
      case 2:
        return PI_STATUS.APPROVED_BY_SALES_MANAGER; // First level approved, waiting for second
      default:
        return PI_STATUS.SUBMITTED;
    }
  }

  // All steps are approved
  return PI_STATUS.APPROVED_BY_ADMIN;
};
*/