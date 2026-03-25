const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../../models/User/userData");
const Notification = require("../../models/Notification/notification");
const { updatePointsOnSubscriptionChange, initializeFarmerPoints } = require("../../utils/points/pointsUtils");

const PLANS = {
  free: { id: "free", name: "Free", monthlyPrice: 0, annualPrice: 0 },
  // Keep prices in sync with frontend/src/assets/plan.js
  premium: {
    id: "premium",
    name: "Premium",
    monthlyPrice: 1599,
    annualPrice: 1279,
  },
  superPremium: {
    id: "superPremium",
    name: "Super Premium",
    monthlyPrice: 4099,
    annualPrice: 3279,
  },
};

function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error("Razorpay env debug:", {
      RAZORPAY_KEY_ID: keyId,
      RAZORPAY_KEY_SECRET: keySecret ? "***set***" : keySecret,
    });
    throw new Error("Razorpay environment variables are not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

exports.createOrder = async (req, res) => {
  try {
    const { planId, billingCycle } = req.body || {};
    const userId = req.userId;

    if (!planId || !billingCycle) {
      return res.status(400).json({
        success: false,
        msg: "planId and billingCycle are required",
      });
    }

    const plan = PLANS[planId];
    if (!plan || plan.id === "free") {
      return res.status(400).json({
        success: false,
        msg: "Invalid plan selected",
      });
    }

    const isAnnual = billingCycle === "annual";
    const baseAmount = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    const gst = Math.round(baseAmount * 0.18);
    const total = baseAmount + gst;

    const instance = getRazorpayInstance();

    const options = {
      amount: total * 100, // INR -> paise
      currency: "INR",
      receipt: `sub_${planId}_${Date.now()}`,
      notes: {
        userId: String(userId),
        planId,
        billingCycle,
      },
    };

    const order = await instance.orders.create(options);

    return res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order,
      plan,
      billingCycle,
      amountBreakup: {
        baseAmount,
        gst,
        total,
      },
    });
  } catch (error) {
    console.error("CREATE_ORDER_ERROR:", error);
    return res.status(500).json({
      success: false,
      msg: "Failed to create order",
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      billingCycle,
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        msg: "Missing Razorpay payment details",
      });
    }

    const plan = PLANS[planId];
    if (!plan || plan.id === "free") {
      return res.status(400).json({
        success: false,
        msg: "Invalid plan",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        msg: "Payment signature verification failed",
      });
    }

    const isAnnual = billingCycle === "annual";

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    const now = new Date();
    const endDate = new Date(
      isAnnual
        ? now.getTime() + 365 * 24 * 60 * 60 * 1000
        : now.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    // Calculate pricing
    const baseAmount = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    const gstAmount = Math.round(baseAmount * 0.18);
    const totalAmount = baseAmount + gstAmount;

    // Update subscription (legacy field for backward compatibility)
    user.subscription = user.subscription || {};
    user.subscription.plan = plan.name;
    user.subscription.startDate = now;
    user.subscription.endDate = endDate;

    // Update activePlan (new field)
    user.activePlan = {
      planId: planId,
      planName: plan.name,
      status: 'active',
      billingCycle: billingCycle,
      currentPrice: baseAmount,
      gst: gstAmount,
      totalPrice: totalAmount,
      startDate: now,
      endDate: endDate,
      renewalDate: endDate,
      autoRenew: true,
      isTrialPlan: false,
      trialDaysLeft: 0,
      lastRenewalDate: null,
      paymentStatus: 'completed',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      features: [
        {
          featureName: 'basic_features',
          isEnabled: true,
          usage: 0,
          limit: null
        }
      ],
      upgradedFrom: user.activePlan?.planId || 'free',
      renewalAttempts: 0,
      lastFailedRenewal: null
    };

    // Update farmer points based on new subscription tier
    if (!user.farmerPoints || !user.farmerPoints.totalPoints) {
      user.farmerPoints = initializeFarmerPoints(plan.name);
    } else {
      updatePointsOnSubscriptionChange(user, plan.name);
    }

    await user.save();

    // Create a billing notification (best-effort)
    try {
      await Notification.create({
        userId: user._id,
        title: "Subscription activated",
        message: `Your ${plan.name} plan (${isAnnual ? "annual" : "monthly"}) is now active.`,
        type: "billing",
      });
    } catch (notifyErr) {
      console.error("BILLING_NOTIFICATION_CREATE_ERROR:", notifyErr);
    }

    const responseUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      subscription: user.subscription,
      activePlan: user.activePlan,
    };

    return res.status(200).json({
      success: true,
      msg: "Subscription updated",
      user: responseUser,
    });
  } catch (error) {
    console.error("VERIFY_PAYMENT_ERROR:", error);
    return res.status(500).json({
      success: false,
      msg: "Failed to verify payment",
    });
  }
};

