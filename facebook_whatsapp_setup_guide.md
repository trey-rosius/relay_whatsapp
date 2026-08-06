# Step-by-Step Guide: Facebook Business & WhatsApp Cloud API Setup

This guide provides the complete, end-to-end process for setting up a **Meta Facebook Business Account**, registering a **WhatsApp Phone Number**, creating an **Admin System User**, granting required **permissions**, and generating a **Permanent Access Token**.

---

## 📌 Prerequisites

Before starting, ensure you have:
1. A personal **Facebook Account** (used to log into Meta Developers).
2. A **Phone Number** dedicated to your WhatsApp bot (SMS or Voice call capable). 
   > ⚠️ **Important:** The phone number must **not** be registered on an active personal/business WhatsApp mobile app. If it is, delete the account in the WhatsApp app settings first.

---

## 🛠️ Step 1: Create a Meta Developer App

1. Go to [developers.facebook.com](https://developers.facebook.com) and log in.
2. Click **My Apps** in the top-right corner → Click **Create App**.
3. Select **Use case** → Choose **Other** → Click **Next**.
4. Select **App type** → Choose **Business** → Click **Next**.
5. Fill in details:
   - **App Name:** e.g., `Relay Community Books App`
   - **App Contact Email:** Your business/admin email.
   - **Business Portfolio:** Select your Meta Business Account (or create a new one).
6. Click **Create App**.

---

## 📱 Step 2: Add WhatsApp Product to your App

1. In your App Dashboard, scroll down to **Add products to your app**.
2. Find **WhatsApp** and click **Set up**.
3. Select your **Meta Business Portfolio** and click **Continue**.

---

## 👥 Step 3: Create a System User & Grant Admin Rights

Temporary test tokens expire in 24 hours. To run a 24/7 production bot, you must create a **System User** with **Admin** access in Meta Business Manager.

1. Open [Meta Business Settings](https://business.facebook.com/settings/).
2. Under **Users** in the left sidebar, click **System Users**.
3. Click **Add**.
4. Set:
   - **System User Name:** e.g., `WhatsApp-Bot-Admin`
   - **System User Role:** Select **Admin** (Full Control).
5. Click **Create System User**.

### Assign Assets to System User:
1. Select your new System User and click **Assign Assets**.
2. Under **Apps**, select your app (`Relay Community Books App`).
3. Toggle on **Full Control (Manage App)**.
4. Under **WhatsApp Business Accounts**, select your account.
5. Toggle on **Full Control (Manage WhatsApp Business Account)**.
6. Click **Save Changes**.

---

## 🔑 Step 4: Generate Permanent Access Token & Permissions

1. In **Meta Business Settings → System Users**, select `WhatsApp-Bot-Admin`.
2. Click **Generate New Token**.
3. Select your App (`Relay Community Books App`).
4. Set **Token Expiration**: Select **Never** (or **60 days** if required by policy).
5. Under **Permissions**, select the following mandatory scopes:
   - ✅ `whatsapp_business_messaging` (Allows sending & receiving messages)
   - ✅ `whatsapp_business_management` (Allows managing phone numbers & templates)
6. Click **Generate Token**.
7. **COPY AND SAVE THIS TOKEN IMMEDIATELY!** Meta will never display it again.

---

## 📞 Step 5: Register & Verify Real Phone Number

1. Return to [developers.facebook.com](https://developers.facebook.com) → **My Apps** → Select your App.
2. In the left sidebar, click **WhatsApp → API Setup**.
3. Scroll down to **Step 5: Add a Phone Number** → Click **Add Phone Number**.
4. Fill in your Business Profile:
   - **WhatsApp Business Profile Name:** e.g. `Relay Books Community`
   - **Category:** e.g. `Education` / `Non-Profit`
5. Enter your dedicated phone number with country code (e.g., `+237...` or `+1...`).
6. Choose verification method: **Text Message (SMS)** or **Voice Call**.
7. Enter the 6-digit verification code sent to your phone.
8. Once verified, copy your **Phone Number ID** (e.g. `1251548201371379`).

---

## 🔗 Step 6: Configure Webhook Endpoint

1. In the left menu under **WhatsApp**, click **Configuration**.
2. Under **Webhook**, click **Edit**.
3. Set fields:
   - **Callback URL:** `https://0bur1ooy7b.execute-api.us-east-1.amazonaws.com/prod/webhook`
   - **Verify Token:** `my_verify_token_123` (or your custom secret phrase).
4. Click **Verify and Save**.
5. Under **Webhook Fields**, find **messages** and click **Subscribe**.

---

## ⚙️ Step 7: Environment Variable Summary

Update your production `.env` or deployment settings with the values obtained:

```env
WHATSAPP_TOKEN=EAAG... (Permanent System User Token from Step 4)
WHATSAPP_VERIFY_TOKEN=my_verify_token_123 (Verify Token from Step 6)
WHATSAPP_PHONE_NUMBER_ID=1251548201371379 (Phone Number ID from Step 5)
```
