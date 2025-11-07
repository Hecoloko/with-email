// supabase/functions/notify/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Deno requires this declaration
declare const Deno: any;

// CORS headers to allow requests from the browser
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- API Error Handler ---
// Provides more user-friendly error messages for common issues.
const handleApiError = (apiName: string, errorMessage: string): Response => {
    console.error(`${apiName} Error:`, errorMessage);
    const lowerCaseError = errorMessage.toLowerCase();
    
    let userFriendlyError = `Failed to send via ${apiName}. Please check the function logs.`;
    if (lowerCaseError.includes('balance') || lowerCaseError.includes('funds') || lowerCaseError.includes('credit')) {
        userFriendlyError = `Failed to send: Insufficient balance in your ${apiName} account. Please add funds.`;
    } else if (lowerCaseError.includes('unauthorized') || lowerCaseError.includes('authenticate')) {
      userFriendlyError = `Failed to send: ${apiName} authentication error. Please check your Environment Variables in the Supabase dashboard.`;
    } else {
      userFriendlyError = errorMessage;
    }
    return new Response(JSON.stringify({ error: userFriendlyError }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
};

// --- Send Email Logic (using SendGrid) ---
async function sendEmail(payload: any) {
  const { to, subject, body } = payload;
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  const SENDGRID_FROM_EMAIL = Deno.env.get('SENDGRID_FROM_EMAIL');

  if (!SENDGRID_API_KEY || !SENDGRID_FROM_EMAIL) {
    return handleApiError('SendGrid', 'SENDGRID_API_KEY or SENDGRID_FROM_EMAIL environment variables are not set.');
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: SENDGRID_FROM_EMAIL },
      subject: subject,
      content: [{ type: 'text/plain', value: body }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    const errorMessage = errorBody.errors?.[0]?.message || `SendGrid API Error: ${response.status} ${response.statusText}`;
    return handleApiError('SendGrid', errorMessage);
  }

  return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

// --- Send SMS Logic (using Twilio) ---
async function sendSms(payload: any) {
  const { to, body } = payload;
  const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
  const TWILIO_FROM_PHONE = Deno.env.get('TWILIO_FROM_PHONE');

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_PHONE) {
    return handleApiError('Twilio', 'One or more Twilio environment variables are not set.');
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const authHeader = `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`;
  
  const requestBody = new URLSearchParams();
  requestBody.append('To', to);
  requestBody.append('From', TWILIO_FROM_PHONE);
  requestBody.append('Body', body);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: requestBody.toString(),
  });

  const result = await response.json();
  if (!response.ok) {
    const errorMessage = result.message || `Twilio API Error: ${response.status} ${response.statusText}`;
    return handleApiError('Twilio', errorMessage);
  }

  return new Response(JSON.stringify({ success: true, sid: result.sid }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

// --- Main Server Logic ---
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('User auth error:', userError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { channel, ...payload } = await req.json();

    if (channel === 'email') {
      return await sendEmail(payload);
    } else if (channel === 'sms') {
      return await sendSms(payload);
    } else {
      return new Response(JSON.stringify({ error: 'Invalid channel specified' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});