const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const Order = require('../models/Order');
const { createNotification, notifyMembership } = require('../services/notificationService');
const { sendEmail } = require('../services/emailService');
const { logger } = require('../middleware/logger');
const { logAction } = require('../middleware/audit');

// Membership plan pricing (for notifications)
const PLAN_PRICES = { basic: 999, pro: 1999, premium: 3999 };
const PLAN_DURATIONS = { '1-month': 30, '3-months': 90, '6-months': 180, '12-months': 365 };

// Verify Razorpay webhook signature
function verifyWebhookSignature(body, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

// POST /api/webhooks/razorpay
router.post('/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (webhookSecret) {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.body.toString();

    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      logger.warn('Invalid Razorpay webhook signature');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  }

  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  }

  const { event: eventType, payload } = event;
  logger.info(`Razorpay webhook: ${eventType}`);

  try {
    switch (eventType) {
      case 'payment.captured': {
        const payment = payload.payment?.entity;
        if (!payment) break;

        const orderId = payment.notes?.orderId;
        if (orderId) {
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'Paid',
            status: 'Processing',
            paymentId: payment.id,
          });
        }

        // Award membership if it was a membership payment
        const membershipPlan = payment.notes?.membershipPlan;
        const userId = payment.notes?.userId;

        if (userId && membershipPlan) {
          const durationKey = payment.notes?.duration || '1-month';
          const daysToAdd = PLAN_DURATIONS[durationKey] || 30;
          const endDate = new Date(Date.now() + daysToAdd * 86400000);
          const planName = membershipPlan.charAt(0).toUpperCase() + membershipPlan.slice(1);

          await User.findByIdAndUpdate(userId, {
            membership: planName,
            membershipEndDate: endDate,
            membershipStartDate: new Date(),
          });

          await notifyMembership(userId, planName, endDate);
          logger.info(`Membership activated: ${userId} → ${planName}`);
        }
        break;
      }

      case 'payment.failed': {
        const payment = payload.payment?.entity;
        if (!payment) break;

        const userId = payment.notes?.userId;
        if (userId) {
          await createNotification({
            userId,
            type: 'membership',
            title: '⚠️ Payment Failed',
            message: 'Your payment could not be processed. Please retry to activate your membership.',
            link: '/pricing',
          });

          // Send failure email
          const user = await User.findById(userId).select('name email').lean();
          if (user) {
            sendEmail({
              to: user.email,
              subject: '⚠️ AuraFit Payment Failed',
              html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:16px;">
                  <h1 style="color:#ff4444;">Payment Failed</h1>
                  <p style="color:#ccc;">Hi ${user.name}, your payment of ₹${payment.amount / 100} could not be processed.</p>
                  <p style="color:#ccc;">Error: ${payment.error_description || 'Unknown error'}</p>
                  <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/pricing"
                    style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#9d00ff,#00d4ff);color:#fff;border-radius:10px;text-decoration:none;font-weight:700;margin-top:16px;">
                    Retry Payment
                  </a>
                </div>
              `,
            }).catch(() => {});
          }
        }
        break;
      }

      case 'subscription.charged': {
        const subscription = payload.subscription?.entity;
        const payment = payload.payment?.entity;
        if (!subscription || !payment) break;

        const userId = subscription.notes?.userId;
        if (userId) {
          const planName = subscription.notes?.plan || 'Pro';
          const endDate = new Date(subscription.current_end * 1000);

          await User.findByIdAndUpdate(userId, {
            membership: planName,
            membershipEndDate: endDate,
          });

          await notifyMembership(userId, planName, endDate);
          logger.info(`Subscription renewed: ${userId} → ${planName}`);
        }
        break;
      }

      case 'subscription.cancelled': {
        const subscription = payload.subscription?.entity;
        if (!subscription) break;

        const userId = subscription.notes?.userId;
        if (userId) {
          await createNotification({
            userId,
            type: 'membership',
            title: 'Membership Cancelled',
            message: 'Your subscription has been cancelled. Your access continues until the period end.',
            link: '/pricing',
          });
        }
        break;
      }

      case 'refund.created': {
        const refund = payload.refund?.entity;
        if (!refund) break;
        logger.info(`Refund created: ${refund.id} — ₹${refund.amount / 100}`);
        break;
      }

      default:
        logger.debug(`Unhandled webhook event: ${eventType}`);
    }

    res.json({ success: true, received: true });
  } catch (err) {
    logger.error(`Webhook processing error [${eventType}]:`, err.message);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

module.exports = router;
