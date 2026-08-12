'use server';

export async function subscribeToNewsletter(email: string) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address' };
  }

  const formId = process.env.KIT_FORM_ID;
  const apiKey = process.env.KIT_API_KEY;

  if (!formId || !apiKey) {
    console.error('subscribeToNewsletter: missing KIT_FORM_ID or KIT_API_KEY env vars');
    return { error: 'Something went wrong. Please try again later.' };
  }

  try {
    const response = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ api_key: apiKey, email }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('subscribeToNewsletter: Kit API error', data);
      return { error: 'Something went wrong. Please try again later.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('subscribeToNewsletter: request failed', err.message);
    return { error: 'Something went wrong. Please try again later.' };
  }
}