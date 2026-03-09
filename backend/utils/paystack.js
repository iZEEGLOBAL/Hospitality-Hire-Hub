const axios = require('axios');

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Initialize transaction
exports.initializeTransaction = async (email, amount, metadata = {}) => {
  try {
    const response = await paystack.post('/transaction/initialize', {
      email,
      amount: amount * 100, // Paystack expects amount in kobo
      metadata,
      callback_url: process.env.PAYSTACK_CALLBACK_URL,
    });
    return response.data;
  } catch (error) {
    console.error('Paystack initialize error:', error.response?.data || error.message);
    throw error;
  }
};

// Verify transaction
exports.verifyTransaction = async (reference) => {
  try {
    const response = await paystack.get(`/transaction/verify/${reference}`);
    return response.data;
  } catch (error) {
    console.error('Paystack verify error:', error.response?.data || error.message);
    throw error;
  }
};

// Create subscription plan
exports.createPlan = async (name, amount, interval, description = '') => {
  try {
    const response = await paystack.post('/plan', {
      name,
      amount: amount * 100,
      interval,
      description,
    });
    return response.data;
  } catch (error) {
    console.error('Paystack create plan error:', error.response?.data || error.message);
    throw error;
  }
};

// Create subscription
exports.createSubscription = async (customer, plan, authorization) => {
  try {
    const response = await paystack.post('/subscription', {
      customer,
      plan,
      authorization,
    });
    return response.data;
  } catch (error) {
    console.error('Paystack create subscription error:', error.response?.data || error.message);
    throw error;
  }
};

// Disable subscription
exports.disableSubscription = async (code, token) => {
  try {
    const response = await paystack.post('/subscription/disable', {
      code,
      token,
    });
    return response.data;
  } catch (error) {
    console.error('Paystack disable subscription error:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch subscription
exports.fetchSubscription = async (subscriptionId) => {
  try {
    const response = await paystack.get(`/subscription/${subscriptionId}`);
    return response.data;
  } catch (error) {
    console.error('Paystack fetch subscription error:', error.response?.data || error.message);
    throw error;
  }
};

// Create customer
exports.createCustomer = async (email, firstName, lastName, phone) => {
  try {
    const response = await paystack.post('/customer', {
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
    });
    return response.data;
  } catch (error) {
    console.error('Paystack create customer error:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch customer
exports.fetchCustomer = async (emailOrCode) => {
  try {
    const response = await paystack.get(`/customer/${emailOrCode}`);
    return response.data;
  } catch (error) {
    console.error('Paystack fetch customer error:', error.response?.data || error.message);
    throw error;
  }
};

// Create transfer recipient
exports.createTransferRecipient = async (type, name, accountNumber, bankCode, currency = 'NGN') => {
  try {
    const response = await paystack.post('/transferrecipient', {
      type,
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency,
    });
    return response.data;
  } catch (error) {
    console.error('Paystack create recipient error:', error.response?.data || error.message);
    throw error;
  }
};

// Initiate transfer
exports.initiateTransfer = async (amount, recipient, reason) => {
  try {
    const response = await paystack.post('/transfer', {
      source: 'balance',
      amount: amount * 100,
      recipient,
      reason,
    });
    return response.data;
  } catch (error) {
    console.error('Paystack initiate transfer error:', error.response?.data || error.message);
    throw error;
  }
};

// List banks
exports.listBanks = async (country = 'nigeria') => {
  try {
    const response = await paystack.get(`/bank?country=${country}`);
    return response.data;
  } catch (error) {
    console.error('Paystack list banks error:', error.response?.data || error.message);
    throw error;
  }
};

// Resolve account number
exports.resolveAccount = async (accountNumber, bankCode) => {
  try {
    const response = await paystack.get(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);
    return response.data;
  } catch (error) {
    console.error('Paystack resolve account error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = paystack;
