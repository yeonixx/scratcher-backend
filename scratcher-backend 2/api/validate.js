// GET /api/validate?token=xxx
// Checks if token is valid and unused

export default async function handler(req, res) {
  // Allow CORS from your Shopify store
  res.setHeader('Access-Control-Allow-Origin', 'https://crookedchristian.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { token } = req.query;
  if (!token) return res.status(400).json({ valid: false, error: 'No token provided' });

  try {
    // Search orders with this token in metafields via Shopify Admin API
    const shopDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const adminToken  = process.env.SHOPIFY_ADMIN_TOKEN;

    // Use GraphQL to find order with matching scratcher.token metafield
    const query = `
      {
        orders(first: 1, query: "metafields.scratcher.token:${token}") {
          edges {
            node {
              id
              metafield(namespace: "scratcher", key: "token") { value }
              used: metafield(namespace: "scratcher", key: "used") { value }
              slots: metafield(namespace: "scratcher", key: "slots") { value }
              prize: metafield(namespace: "scratcher", key: "prize") { value }
              winRow: metafield(namespace: "scratcher", key: "win_row") { value }
            }
          }
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
        body: JSON.stringify({ query }),
      }
    );

    const data = await response.json();
    const edges = data?.data?.orders?.edges;

    if (!edges || edges.length === 0) {
      return res.status(200).json({ valid: false, used: false });
    }

    const order = edges[0].node;
    const storedToken = order.metafield?.value;
    const used = order.used?.value === 'true';

    if (storedToken !== token) {
      return res.status(200).json({ valid: false, used: false });
    }

    const slots = JSON.parse(order.slots?.value || '[]');
    const winSym = order.prize?.value;
    const winRow = parseInt(order.winRow?.value || '0');
    const orderId = order.id;

    return res.status(200).json({
      valid: true,
      used,
      slots,
      winSym,
      winRow,
      orderId,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ valid: false, error: 'Server error' });
  }
}
