/**
 * MSAIDIZI CALLBACK - WhatsApp AI Bot - FIXED
 */
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'msaidizi123';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN; 
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '1296392916901346';
const GRAPH_API_VERSION = 'v20.0';

app.get('/', (req, res) => {
  res.send('MsaidiziHub Bot is Running! Webhook: /webhook - TOKEN OK: ' + (ACCESS_TOKEN ? 'YES' : 'NO'));
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  console.log(`VERIFY ATTEMPT token=${token} expected=${VERIFY_TOKEN}`);
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK VERIFIED!');
    res.status(200).send(challenge);
  } else {
    console.log('VERIFY FAILED');
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  console.log('=== INCOMING WEBHOOK ===');
  console.log(JSON.stringify(req.body).substring(0, 2000));
  res.sendStatus(200); // jibu Meta haraka

  try {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const value = change.value;
        if (!value.messages || !value.messages[0]) {
          console.log('No messages - status update maybe');
          continue;
        }
        const from = value.messages[0].from;
        const msgBody = value.messages[0].text?.body || '';
        const name = value.contacts?.[0]?.profile?.name || 'Mteja';
        console.log(`UJUMBE kutoka ${name} (${from}): ${msgBody}`);

        let reply = '';
        const lower = msgBody.toLowerCase();
        if (lower.includes('habari') || lower.includes('hello') || lower.includes('mambo') || lower.includes('hi')) {
          reply = `Habari ${name}! 👋 Karibu MsaidiziHub. Mimi ni Msaidizi AI.\n\nNaweza kukusaidia na:\n1. Kufunga Callback\n2. Huduma zetu\n3. Kuongea na mtu\n\nAndika neno moja tu.`;
        } else if (lower.includes('callback') || lower.trim() === '1') {
          reply = `Sawa! Tuta-kupigia callback. Tuma:\n• Jina lako\n• Namba\n• Muda mzuri\n\nAu tuma namba yako moja kwa moja.`;
        } else if (lower.includes('huduma') || lower.trim() === '2') {
          reply = `Huduma MsaidiziHub:\n✅ WhatsApp Bot kama hii\n✅ Mfumo wa Callback\n✅ CRM\n\nGharama 30k/mwezi. Unataka demo?`;
        } else {
          reply = `Asante "${msgBody}" 🙏 Nimepokea. Timu itakujibu. Andika "callback" kama unataka tupige simu sasa.`;
        }

        // TUMA
        if (!ACCESS_TOKEN) {
          console.error('ERROR: ACCESS_TOKEN haipo! Weka kwenye Render Environment');
          return;
        }
        const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`;
        console.log(`SENDING to ${from} via ${url}`);
        const result = await axios.post(url, {
          messaging_product: 'whatsapp',
          to: from,
          type: 'text',
          text: { body: reply }
        }, {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('SEND OK:', result.data);
      }
    }
  } catch (err) {
    console.error('SEND ERROR:', err.response?.data || err.message);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Bot running on port ${PORT} - TOKEN SET: ${!!ACCESS_TOKEN}`));
