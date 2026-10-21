/**
 * MSAIDIZI CALLBACK - WhatsApp AI Bot
 * Deploy kwenye Render.com (FREE)
 */

const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// === WEKA HAPA DETAILS ZAKO ===
const VERIFY_TOKEN = 'msaidizi123'; // hii ndio utaweka kwenye Meta pia
const ACCESS_TOKEN = 'EABBIx...WEKA TOKEN YAKO MPYA HAPA'; // Token uloi-generate
const PHONE_NUMBER_ID = '1296392916901346';
const GRAPH_API_VERSION = 'v25.0';

// Homepage
app.get('/', (req, res) => {
  res.send('MsaidiziHub Bot is Running! Webhook: /webhook');
});

// 1. VERIFICATION - Meta ita-check hapa
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK VERIFIED!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 2. RECEIVE MESSAGES
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'whatsapp_business_account') {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const value = change.value;
        if (value.messages && value.messages[0]) {
          const from = value.messages[0].from; // namba ya mteja
          const msgBody = value.messages[0].text?.body || '';
          const name = value.contacts?.[0]?.profile?.name || 'Mteja';

          console.log(`Ujumbe kutoka ${name} (${from}): ${msgBody}`);

          // === LOGIC YA AI (Rahisi, unaweza i-connect na OpenAI baadaye) ===
          let reply = '';

          const lower = msgBody.toLowerCase();
          if (lower.includes('habari') || lower.includes('hello') || lower.includes('mambo')) {
            reply = `Habari ${name}! 👋 Karibu MsaidiziHub. Naitwa Msaidizi AI.\n\nNaweza kukusaidia na nini leo?\n1. Kufunga Callback\n2. Kujua huduma zetu\n3. Kuongea na mtu`;
          } else if (lower.includes('callback') || lower.includes('1')) {
            reply = `Sawa! Tuta-kupigia callback. Tafadhali tuma:\n• Jina lako\n• Namba ya kupigiwa\n• Muda mzuri wa kupigiwa\n\nAu tuma namba yako moja kwa moja kama ${from}`;
          } else if (lower.includes('huduma') || lower.includes('2')) {
            reply = `Huduma zetu MsaidiziHub:\n✅ WhatsApp Bot kama hii\n✅ Mfumo wa Callback automatiki\n✅ CRM ya wateja\n\nGharama kuanzia TZS 30,000/mwezi. Unataka demo?`;
          } else {
            reply = `Asante kwa ujumbe wako: "${msgBody}"\n\nNimepokea. Timu yetu itakujibu muda mfupi. Au andika "callback" kama unataka tupige simu sasa hivi.`;
          }

          // TUMA JIBU
          await sendWhatsAppMessage(from, reply);
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

async function sendWhatsAppMessage(to, text) {
  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`;
    await axios.post(url, {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: text }
    }, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`Jibu limetumwa kwa ${to}`);
  } catch (err) {
    console.error('Error kutuma:', err.response?.data || err.message);
  }
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Bot running on port ${PORT}`));
