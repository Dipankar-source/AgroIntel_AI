/**
 * Migration Script: Initialize activePlan field for existing users
 * This script adds the activePlan field to all existing users based on their subscription data
 * 
 * Run this script once to migrate all existing users to the new schema
 */

const User = require("../../models/User/userData");

/**
 * Migrate a single user's subscription data to activePlan format
 * @param {Object} user - The user document
 * @returns {Promise<Object>} - Updated user with activePlan field
 */
const migrateUserActivePlan = async (user) => {
  try {
    // Map subscription plan names to plan IDs
    const planNameToId = {
      "Free": "free",
      "Premium": "premium",
      "Super Premium": "superPremium",
      "Basic": "premium", // Fallback: Basic maps to premium
      "Enterprise": "superPremium" // Fallback: Enterprise maps to superPremium
    };

    // Get the current plan from subscription or default to free
    const subscriptionPlan = user.subscription?.plan || "Free";
    const planId = planNameToId[subscriptionPlan] || "free";

    // Determine if plan is active based on endDate
    const now = new Date();
    const isExpired = user.subscription?.endDate && user.subscription.endDate < now;
    const status = isExpired ? "expired" : (planId === "free" ? "active" : "active");

    // Create the activePlan object
    const activePlan = {
      planId: planId,
      planName: subscriptionPlan || "Free",
      status: status,
      billingCycle: user.subscription?.billingCycle || "monthly",
      currentPrice: 0, // Approximate - will be updated on next renewal
      gst: 0,
      totalPrice: 0,
      startDate: user.subscription?.startDate || new Date(),
      endDate: user.subscription?.endDate || null,
      renewalDate: user.subscription?.endDate || null,
      autoRenew: user.subscription?.autoRenew !== false,
      isTrialPlan: false,
      trialDaysLeft: 0,
      lastRenewalDate: null,
      cancellationDate: null,
      cancellationReason: null,
      paymentStatus: "completed",
      razorpayOrderId: null,
      razorpayPaymentId: null,
      features: [
        {
          featureName: "basic_features",
          isEnabled: true,
          usage: 0,
          limit: null
        }
      ],
      upgradedFrom: null,
      renewalAttempts: 0,
      lastFailedRenewal: null
    };

    // Update the user with activePlan
    user.activePlan = activePlan;
    await user.save();

    return user;
  } catch (error) {
    console.error(`Error migrating user ${user._id}:`, error);
    throw error;
  }
};

/**
 * Main migration function - migrates all users
 * @returns {Promise<Object>} - Migration result with stats
 */
const migrateAllUsers = async () => {
  try {
    console.log("Starting migration of activePlan field...");

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Migrate each user
    for (const user of users) {
      try {
        await migrateUserActivePlan(user);
        successCount++;
        console.log(`✓ Migrated user: ${user.email}`);
      } catch (error) {
        errorCount++;
        errors.push({
          userId: user._id,
          email: user.email,
          error: error.message
        });
        console.error(`✗ Failed to migrate user: ${user.email}`, error.message);
      }
    }

    const result = {
      totalUsers: users.length,
      successCount,
      errorCount,
      errors,
      message: `Migration completed. ${successCount} users migrated, ${errorCount} failed.`
    };

    console.log("\n" + result.message);
    return result;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

/**
 * Dry run - shows what would be changed without modifying the database
 */
const dryRunMigration = async () => {
  try {
    console.log("Starting DRY RUN of activePlan migration...");

    const users = await User.find({}).limit(5); // Sample 5 users
    console.log(`Sample: ${users.length} users`);

    for (const user of users) {
      const planNameToId = {
        "Free": "free",
        "Premium": "premium",
        "Super Premium": "superPremium",
        "Basic": "premium",
        "Enterprise": "superPremium"
      };

      const subscriptionPlan = user.subscription?.plan || "Free";
      const planId = planNameToId[subscriptionPlan] || "free";

      console.log(`\nUser: ${user.email}`);
      console.log(`  Current subscription plan: ${subscriptionPlan}`);
      console.log(`  Will be mapped to planId: ${planId}`);
      console.log(`  Start date: ${user.subscription?.startDate}`);
      console.log(`  End date: ${user.subscription?.endDate}`);
    }

    console.log("\nDRY RUN completed. No changes made.");
  } catch (error) {
    console.error("Dry run failed:", error);
    throw error;
  }
};

module.exports = {
  migrateUserActivePlan,
  migrateAllUsers,
  dryRunMigration
};
