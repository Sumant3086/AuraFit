// Razorpay Payment Gateway Service
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create Razorpay order
 */
async function createOrder(amount, currency = 'INR', receipt) {
  try {
    const options = {
      amount: amount * 100, // Amount in paise (multiply by 100)
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1 // Auto capture payment
    };

    const order = await razorpay.orders.create(options);
    console.log('✅ Razorpay order created:', order.id);
    
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    };
  } catch (error) {
    console.error('❌ Razorpay order creation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify Razorpay payment signature
 */
function verifyPaymentSignature(orderId, paymentId, signature) {
  try {
    const text = `${orderId}|${paymentId}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    const isValid = generated_signature === signature;
    
    if (isValid) {
      console.log('✅ Payment signature verified');
    } else {
      console.log('❌ Payment signature verification failed');
    }
    
    return isValid;
  } catch (error) {
    console.error('❌ Error verifying payment signature:', error);
    return false;
  }
}

/**
 * Fetch payment details
 */
async function getPaymentDetails(paymentId) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    console.log('✅ Payment details fetched:', paymentId);
    
    return {
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount / 100, // Convert paise to rupees
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        createdAt: payment.created_at
      }
    };
  } catch (error) {
    console.error('❌ Error fetching payment details:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Refund payment
 */
async function refundPayment(paymentId, amount = null) {
  try {
    const refundData = {
      payment_id: paymentId
    };
    
    if (amount) {
      refundData.amount = amount * 100; // Amount in paise
    }
    
    const refund = await razorpay.payments.refund(paymentId, refundData);
    console.log('✅ Refund processed:', refund.id);
    
    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status
    };
  } catch (error) {
    console.error('❌ Error processing refund:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Capture payment (if not auto-captured)
 */
async function capturePayment(paymentId, amount) {
  try {
    const capture = await razorpay.payments.capture(
      paymentId,
      amount * 100, // Amount in paise
      'INR'
    );
    
    console.log('✅ Payment captured:', paymentId);
    
    return {
      success: true,
      payment: capture
    };
  } catch (error) {
    console.error('❌ Error capturing payment:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  createOrder,
  verifyPaymentSignature,
  getPaymentDetails,
  refundPayment,
  capturePayment
};
