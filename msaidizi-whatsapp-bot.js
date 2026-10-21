const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// SOMA KUTOKA ENVIRONMENT - USIWEKE TOKEN HAPA
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'msaidizi123';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '1296392916901346';
const VERSION = 'v20.0';

app.get('/', (req, res) => {
  res.send(`Bot LIVE! Token set: ${!!ACCESS_TOKEN} Phone: ${PHONE_NUMBER_ID}`);
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  console.log(`VERIFY token=${token}`);
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK VERIFIED!');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  console.log('=== INCOMING ===', JSON.stringify(req.body).slice(0,2000));
  res.sendStatus(200);
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const msg = value?.messages?.[0];
    if (!msg) return;
    const from = msg.from;
    const body = msg.text?.body || '';
    const name = value.contacts?.[0]?.profile?.name || 'Mteja';
    console.log(`FROM ${name} ${from}: ${body}`);

    let reply = `Habari ${name}! 👋 Umeandika: "${body}"\n\nBot ya MsaidiziHub iko LIVE na inafanya kazi! 🚀\nAndika "callback" ili tukupigie.`;

    if (!ACCESS_TOKEN) {
      console.error('ACCESS_TOKEN MISSING IN ENV!');
      return;
    }
    const url = `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/messages`;
    const r = await axios.post(url, {
      messaging_product: 'whatsapp',
      to: from,
      type: 'text',
      text: { body: reply }
    }, { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' } });
    console.log('SENT OK', r.data);
  } catch (e) {
    console.error('SEND FAIL', e.response?.data || e.message);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Running on ${PORT} token=${!!ACCESS_TOKEN}`));
