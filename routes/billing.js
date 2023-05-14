const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const settings = require("../settings.json");

const razorpay = new Razorpay({
  key_id: '<YOUR_RAZORPAY_KEY_ID>',
  key_secret: '<YOUR_RAZORPAY_KEY_SECRET>',
});
module.exports.load = async function (app, db) {
router.post('/pay', async (req, res) => {
  try {
    const payment = await razorpay.orders.create({
      amount: req.body.amount,
      currency: 'INR',
      payment_capture: 1,
      receipt: req.body.receipt,
      notes: {
        email: req.body.email,
        phone: req.body.phone,
      },
      method: 'upi',
      upi: {
        vpa: req.body.vpa,
      },
    });
    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong!');
  }
});

module.exports = router;
}