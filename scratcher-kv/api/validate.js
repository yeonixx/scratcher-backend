// GET /api/validate?token=xxx
// Checks if token is valid and unused

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://crookedchristian.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { token } = req.query;
  if (!token) return res.status(400).json({ valid: false, error: 'No token provided' });

  try {
    const ticket = await kv.get(`ticket:${token}`);

    if (!ticket) {
      return res.status(200).json({ valid: false, used: false });
    }

    return res.status(200).json({
      valid: true,
      used: ticket.used,
      slots: ticket.slots,
      winSym: ticket.winSym,
      winRow: ticket.winRow,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ valid: false, error: 'Server error' });
  }
}
