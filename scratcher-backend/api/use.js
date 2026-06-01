// POST /api/use
// Marks a token as used after scratching

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://crookedchristian.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, orderId } = req.body;
  if (!token || !orderId) return res.status(400).json({ error: 'Missing token or orderId' });

  try {
    const shopDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const adminToken  = process.env.SHOPIFY_ADMIN_TOKEN;

    // Update scratcher.used = true via GraphQL mutation
    const mutation = `
      mutation {
        metafieldsSet(metafields: [{
          ownerId: "${orderId}",
          namespace: "scratcher",
          key: "used",
          value: "true",
          type: "boolean"
        }]) {
          metafields { key value }
          userErrors { field message }
        }
      }
    `;

    const response = await fetch(
      `https://${shopDomain}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': adminToken,
        },
        body: JSON.stringify({ query: mutation }),
      }
    );

    const data = await response.json();
    const errors = data?.data?.metafieldsSet?.userErrors;

    if (errors && errors.length > 0) {
      return res.status(400).json({ error: errors[0].message });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
