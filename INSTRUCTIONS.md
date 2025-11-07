# Setup Instructions for Secure Communications

Your app has been upgraded to send emails and SMS messages securely through Supabase Edge Functions. This keeps your API keys safe on the server and out of the browser.

Follow these two steps to get it working.

---

### Step 1: Set Your API Keys as Environment Variables

You must store your secret API keys in your Supabase project's settings, not in the code.

1.  Go to your project on **[app.supabase.com](https://app.supabase.com)**.
2.  Navigate to **Project Settings** (the gear icon).
3.  In the side menu, click on **Edge Functions**.
4.  Scroll down to the **Environment variables** section and click **Add new variable**.
5.  Add the following **five** variables one by one. Make sure the names match exactly.

| Variable Name           | Value                                     | Where to Find It                                                                        |
| ----------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `SENDGRID_API_KEY`      | `SG.xxxx...`                              | In your Twilio SendGrid account under **Settings > API Keys**.                            |
| `SENDGRID_FROM_EMAIL`   | `you@example.com`                         | The verified sender email you created in your Twilio SendGrid account.                  |
| `TWILIO_ACCOUNT_SID`    | `ACxxxx...`                               | On your main Twilio Console dashboard.                                                  |
| `TWILIO_AUTH_TOKEN`     | `xxxx...`                                 | On your main Twilio Console dashboard.                                                  |
| `TWILIO_FROM_PHONE`     | `+1555...`                                | A phone number you purchased or verified in your Twilio account (must be E.164 format). |

---

### Step 2: Deploy the Edge Functions

You need to send the backend code from your `supabase/functions` directory to your Supabase project. This requires the Supabase CLI (Command Line Interface).

1.  **If you don't have the CLI, install it:**
    ```bash
    npm install supabase --save-dev
    ```

2.  **Link your local project to your Supabase project** (you only need to do this once per project):
    ```bash
    npx supabase login
    npx supabase link --project-ref YOUR_PROJECT_ID
    ```
    *(You can find your `YOUR_PROJECT_ID` in your Supabase project's URL: `https://app.supabase.com/project/YOUR_PROJECT_ID`)*

3.  **Deploy BOTH functions:** Run these commands one after the other.
    
    ```bash
    # Deploy the new function for sending emails
    npx supabase functions deploy sendgrid-email --no-verify-jwt

    # Deploy the existing function for sending SMS
    npx supabase functions deploy notify --no-verify-jwt
    ```
    *(The `--no-verify-jwt` flag is necessary because our functions perform their own JWT verification manually inside the code.)*

**That's it!** Once the functions are deployed and your environment variables are set, your app's email and SMS features will be fully functional and secure.

---

### If You Still Have Problems (Chat Script for Supabase AI Assistant)

If things still aren't working, you can copy and paste the following questions into the **Supabase AI Assistant** in your dashboard to help you debug.

```
I'm debugging my Edge Functions. Please help me check the following:

1.  **Deployment Status:** Are the `sendgrid-email` and `notify` functions deployed and healthy? What are their latest version numbers?

2.  **Function Logs:** Please show me the most recent logs for the `sendgrid-email` function. I am looking for any errors related to authentication or API calls.

3.  **Function Logs (SMS):** Please show me the most recent logs for the `notify` function. I am looking for any errors related to Twilio.

4.  **Environment Variables:** Please confirm that the following environment variables are set for my project (do not show me the values): `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_PHONE`.
```