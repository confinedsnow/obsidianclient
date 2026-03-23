export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1482838708146278513/l0pIHMEJy1s3mdeLllZajY8PvbmcXLZQ-c-Tj6a1TZsqXsgGp7JAhnIDmI-Ahhwdd5-';

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'Unknown';

  const { userAgent, referrer, page } = req.body || {};

  let locationInfo = 'Location lookup failed';
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,org`);
    const geo = await geoRes.json();
    if (geo.status === 'success') {
      locationInfo = `${geo.city}, ${geo.regionName}, ${geo.country} — ISP: ${geo.isp}`;
    }
  } catch (_) {}

  const now = new Date();
  const timestamp = now.toUTCString();

  const embed = {
    title: '🔍 New Visitor',
    color: 0x5865F2,
    fields: [
      { name: '🌐 IP Address', value: `\`${ip}\``, inline: true },
      { name: '📍 Location', value: locationInfo, inline: true },
      { name: '🕐 Time', value: timestamp, inline: false },
      { name: '📄 Page', value: page || '/', inline: true },
      { name: '🔗 Referrer', value: referrer || 'Direct / None', inline: true },
      { name: '🖥️ User Agent', value: `\`\`\`${(userAgent || 'Unknown').slice(0, 200)}\`\`\`` },
    ],
    footer: { text: 'IP Tracker' },
  };

  await fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  });

  return res.status(200).json({ ok: true });
}
