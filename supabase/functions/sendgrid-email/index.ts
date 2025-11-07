// supabase/functions/sendgrid-email/index.ts
// Aligned with the user-provided function code.
// Assumptions: Uses Deno runtime, Supabase env vars are available (SENDGRID_API_KEY, SENDGRID_FROM_EMAIL)

console.info('sendgrid-email function starting');

// FIX: Declare Deno to resolve TypeScript errors.
declare const Deno: any;

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.to || !body.subject || !body.text) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: to, subject, text'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const SENDGRID_FROM_EMAIL = Deno.env.get('SENDGRID_FROM_EMAIL');

    if (!SENDGRID_API_KEY || !SENDGRID_FROM_EMAIL) {
      return new Response(JSON.stringify({
        error: 'Missing SendGrid environment variables on Supabase.'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: body.to }],
            subject: body.subject
          }
        ],
        from: { email: SENDGRID_FROM_EMAIL },
        content: [{ type: 'text/plain', value: body.text }]
      })
    });

    const resultText = await sgRes.text();
    if (!sgRes.ok) {
      return new Response(JSON.stringify({
        error: 'SendGrid API error',
        details: resultText
      }), {
        status: 502,
        headers: corsHeaders
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});