import express from 'express';
import { getDB } from '../config/database.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Admin override - manually add credits
router.post('/manual-credit', verifyToken, adminOnly, async (req, res) => {
  try {
    const { userEmail, amount, reason } = req.body;

    if (!userEmail || !amount) {
      return res.status(400).json({
        success: false,
        message: 'User email and amount are required'
      });
    }

    const db = getDB();
    const usersCollection = db.collection('users');
    const auditCollection = db.collection('admin-audit');

    const result = await usersCollection.updateOne(
      { email: userEmail },
      { $inc: { balance: amount } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log admin action
    await auditCollection.insertOne({
      action: 'manual-credit',
      admin: req.userEmail,
      targetUser: userEmail,
      amount,
      reason,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `Added ${amount} credits to ${userEmail}`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add credits',
      error: error.message
    });
  }
});

// Admin override - activate subscription
router.post('/activate-subscription', verifyToken, adminOnly, async (req, res) => {
  try {
    const { userEmail, plan } = req.body;

    if (!userEmail || !plan) {
      return res.status(400).json({
        success: false,
        message: 'User email and plan are required'
      });
    }

    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan. Must be monthly or yearly'
      });
    }

    const db = getDB();
    const usersCollection = db.collection('users');
    const auditCollection = db.collection('admin-audit');

    const expiryDate = new Date();
    if (plan === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    const result = await usersCollection.updateOne(
      { email: userEmail },
      { 
        $set: { 
          subscription: plan,
          subscriptionExpiry: expiryDate,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log admin action
    await auditCollection.insertOne({
      action: 'activate-subscription',
      admin: req.userEmail,
      targetUser: userEmail,
      plan,
      expiryDate,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `Activated ${plan} subscription for ${userEmail}`,
      modifiedCount: result.modifiedCount,
      expiryDate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to activate subscription',
      error: error.message
    });
  }
});

// Admin - block user
router.post('/block-user', verifyToken, adminOnly, async (req, res) => {
  try {
    const { userEmail, reason } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    const db = getDB();
    const usersCollection = db.collection('users');
    const auditCollection = db.collection('admin-audit');

    const result = await usersCollection.updateOne(
      { email: userEmail },
      { 
        $set: { 
          isBlocked: true,
          blockReason: reason || 'Blocked by admin',
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await auditCollection.insertOne({
      action: 'block-user',
      admin: req.userEmail,
      targetUser: userEmail,
      reason,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `User ${userEmail} has been blocked`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to block user',
      error: error.message
    });
  }
});

// Admin - unblock user
router.post('/unblock-user', verifyToken, adminOnly, async (req, res) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    const db = getDB();
    const usersCollection = db.collection('users');
    const auditCollection = db.collection('admin-audit');

    const result = await usersCollection.updateOne(
      { email: userEmail },
      { 
        $set: { 
          isBlocked: false,
          blockReason: null,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await auditCollection.insertOne({
      action: 'unblock-user',
      admin: req.userEmail,
      targetUser: userEmail,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `User ${userEmail} has been unblocked`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to unblock user',
      error: error.message
    });
  }
});

// Admin - get platform statistics
router.get('/statistics', verifyToken, adminOnly, async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = db.collection('users');
    const logsCollection = db.collection('logs');
    const transactionsCollection = db.collection('transactions');

    const totalUsers = await usersCollection.countDocuments();
    const premiumUsers = await usersCollection.countDocuments({ subscription: { $ne: 'free' } });
    const totalToolUses = await logsCollection.countDocuments();
    const totalRevenue = await transactionsCollection
      .find({ status: 'completed' })
      .toArray()
      .then(txns => txns.reduce((sum, txn) => sum + txn.amount, 0));

    res.json({
      success: true,
      statistics: {
        totalUsers,
        premiumUsers,
        freeUsers: totalUsers - premiumUsers,
        totalToolUses,
        totalRevenue,
        platformUptime: process.uptime()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

export default router;
