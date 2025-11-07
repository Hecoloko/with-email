// --- Secure Communications Client ---
// This file calls secure Supabase Edge Functions to send emails.
// All API keys and logic now reside on the server, not in the browser.
import { supabase, functionsUrl } from '../supabaseClient';

interface SendResult {
  success: boolean;
  error?: string;
}

/**
 * Sends an email by invoking the 'sendgrid-email' Supabase Edge Function using a direct fetch call.
 * This is done to control headers precisely and match the function's CORS policy.
 * @param to The recipient's email address.
 * @param subject The subject of the email.
 * @param body The body of the email (as plain text).
 * @returns A promise that resolves to an object indicating success or failure.
 */
export const sendEmail = async (
  to: string | undefined,
  subject: string,
  body: string
): Promise<SendResult> => {
  if (!to) {
    return { success: false, error: "Cannot send email: Applicant's email address is missing." };
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
        throw new Error("User not authenticated.");
    }

    const response = await fetch(`${functionsUrl}/sendgrid-email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ to, subject, text: body }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP Error: ${response.status} ${response.statusText}` }));
      console.error('Edge function responded with an error:', errorData);
      let userMessage = errorData.error || 'An unknown error occurred.';
      if (errorData.details) {
        userMessage += ` Details: ${errorData.details}`;
      }
      return { success: false, error: userMessage };
    }
    
    const responseData = await response.json();

    if (responseData.success) {
      console.log(`Email sent successfully via 'sendgrid-email' function.`);
      return { success: true };
    } else {
      const errorMessage = responseData.error || 'The email could not be sent. Please check the function logs for `sendgrid-email` in your Supabase dashboard.';
      console.error(`Edge function 'sendgrid-email' returned a failure:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  } catch (e: any) {
    console.error(`Client-side error calling 'sendgrid-email' function:`, e);
    let userMessage = e.message;
    if (userMessage.includes('Failed to fetch')) {
        userMessage = 'Network Error: Could not reach the server. Please check your internet connection and ensure the `sendgrid-email` Edge Function is deployed correctly.';
    }
    return { success: false, error: userMessage };
  }
};
