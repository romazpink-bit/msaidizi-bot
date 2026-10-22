const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'msaidizi123';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '1296392916901346';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROUP_LINK = process.env.GROUP_LINK || 'https://chat.whatsapp.com/XXX';
const VERSION = 'v20.0';

async function getAIAnswer(q){
  if(!GROQ_API_KEY) return `Uliuliza: ${q}\n\nWeka GROQ_API_KEY kwenye Render! Nenda console.groq.com/keys`;
  try{
    const r = await axios.post('https://api.groq.com/openai/v1/chat/completions',{
      model:'llama-3.1-8b-instant',
      messages:[
        {role:'system', content:'Wewe ni Msaidizi Hub, msaidizi wa elimu Tanzania. Jibu Kiswahili rahisi.'},
        {role:'user', content:q}
      ]
    },{headers:{'Authorization':`Bearer ${GROQ_API_KEY}`}, timeout:20000});
    return r.data.choices[0].message.content;
  }catch(e){ return `Hitilafu AI: ${e.message}`; }
}

async function sendMessage(to, txt){
  const url = `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/messages`;
  try{
    await axios.post(url, {messaging_product:'whatsapp', to, text:{body:txt.substring(0,4000)}}, {headers:{'Authorization':`Bearer ${ACCESS_TOKEN}`}});
    console.log('SEND OK');
  }catch(e){ console.error('SEND FAIL', e.response?.data); }
}

app.get('/', (req,res)=>res.send(`Bot LIVE! Groq:${!!GROQ_API_KEY}`));
app.get('/webhook', (req,res)=>{ if(req.query['hub.verify_token']===VERIFY_TOKEN) return res.send(req.query['hub.challenge']); res.status(403).send('Fail'); });

app.post('/webhook', async (req,res)=>{
  console.log('INCOMING');
  try{
    const v = req.body.entry?.[0]?.changes?.[0]?.value;
    if(v && v.messages){
      const m = v.messages[0];
      const from = m.from;
      const txt = m.text?.body || '';
      const low = txt.toLowerCase().trim();
      if(['niunge','niweke','naomba niunge','join','niadd'].includes(low)){
        await sendMessage(from, `Karibu MSAIDIZI HUB! 🎉\n\nNimekubali! Bonyeza kujiunga:\n👉 ${GROUP_LINK}`);
      }else{
        const ans = await getAIAnswer(txt);
        await sendMessage(from, ans);
      }
    }
  }catch(e){ console.error(e); }
  res.sendStatus(200);
});

app.listen(process.env.PORT||8000, '0.0.0.0', ()=>console.log('Live'));
