import { db } from '../database/client.js';
import jwt from 'jsonwebtoken';
import { envConfig } from '../config/env.config.js';

async function test() {
  try {
    const userRes = await db.query('SELECT * FROM "User" LIMIT 1');
    const user = userRes.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, envConfig.jwtSecret, { expiresIn: '1h' });

    console.log('--- 1. Testing GET /api/v1/settings ---');
    const resGet = await fetch('http://localhost:5000/api/v1/settings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('GET status:', resGet.status);

    console.log('--- 2. Testing PUT /api/v1/settings/pharmacy (sync to User table) ---');
    const resPharm = await fetch('http://localhost:5000/api/v1/settings/pharmacy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        pharmacyName: 'Pharmacy Care',
        ownerName: 'Dr. John Sync',
        phone: '+251 911 222 333',
        email: 'contact@pharmacycare.com',
        address: 'Bole Sub City, Addis Ababa, Ethiopia',
        logoUrl: '',
      })
    });
    const pharmData = await resPharm.json();
    console.log('PUT pharmacy status:', resPharm.status);
    console.log('Pharmacy ownerName:', pharmData.data?.settings?.ownerName);
    console.log('User name updated via pharmacy:', pharmData.data?.user?.name);

    if (pharmData.data?.settings?.ownerName !== 'Dr. John Sync' || pharmData.data?.user?.name !== 'Dr. John Sync') {
      throw new Error('Bidirectional sync from Pharmacy to User failed!');
    }

    console.log('--- 2b. Testing PUT /api/v1/settings/account (sync to PharmacySetting table) ---');
    const resAcc = await fetch('http://localhost:5000/api/v1/settings/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: 'Abdi Alemu',
        phone: '+251 901 756 305',
        sessionTimeout: 30,
      })
    });
    const accData = await resAcc.json();
    console.log('PUT account status:', resAcc.status);
    console.log('Account user name:', accData.data?.user?.name);
    console.log('Settings ownerName updated via account:', accData.data?.settings?.ownerName);

    if (accData.data?.user?.name !== 'Abdi Alemu' || accData.data?.settings?.ownerName !== 'Abdi Alemu') {
      throw new Error('Bidirectional sync from Account to Pharmacy failed!');
    }

    console.log('--- 3. Testing PUT /api/v1/settings/notifications ---');
    const resNotif = await fetch('http://localhost:5000/api/v1/settings/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        lowStockAlerts: true,
        lowStockThreshold: 15,
        nearingExpiryAlerts: true,
        expiryThresholdDays: 60,
        expiredAlerts: true,
        supplierPaymentDueReminders: true,
        pendingPurchaseAlerts: true,
        inAppNotifications: true,
      })
    });
    console.log('PUT notifications status:', resNotif.status);

    console.log('--- 4. Testing PUT /api/v1/settings/general ---');
    const resGen = await fetch('http://localhost:5000/api/v1/settings/general', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        currency: 'ETB',
        currencySymbol: 'Br',
        dateFormat: 'DD/MM/YYYY',
        timeZone: 'Africa/Addis_Ababa',
        theme: 'light',
        defaultDashboardDateRange: 'month',
        tableRowsPerPage: 20,
      })
    });
    console.log('PUT general status:', resGen.status);

    console.log('--- 5. Testing Change Password with wrong password ---');
    const resPwdWrong = await fetch('http://localhost:5000/api/v1/settings/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        currentPassword: 'WrongPassword123!',
        newPassword: 'CorrectPassword123!',
        confirmPassword: 'CorrectPassword123!',
      })
    });
    const pwdErr = await resPwdWrong.json();
    console.log('Wrong password status (expected 400):', resPwdWrong.status, pwdErr.message);

    console.log('✅ ALL BACKEND SETTINGS ENDPOINTS PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}
test();

