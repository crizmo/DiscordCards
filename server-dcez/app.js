const express = require('express');
const app = express();

const { Client } = require('discord.js');
const Discord = require('discord.js');
const client = new Client({ intents: 32767 });
require('dotenv').config();

const args = process.argv.slice(2);
let port = 3001;
if (process.env.PORT) {
    port = parseInt(process.env.PORT);
} else if (args.length > 0 && args[0] === '--port') {
    port = parseInt(args[1]) || port;
}

const http = require('http')
const cors = require('cors');
app.use(cors())

const nocache = require('./cache/nocache');
app.use(nocache());

const server = http.createServer(app)
const serverPort = process.env.PORT || 3001;

const start = require('./lib/base_endpoints/start')
app.use('/', start)

const api = require('./lib/api')
app.use('/api/card', api)

const api_xomp = require('./lib/api_xomp')
app.use('/api/compact', api_xomp)

client.on('ready', () => {
    console.log('Status is ready!');
    client.user.setStatus('idle');
    let index = 0;
    setInterval(() => {
      const arrayOfStatus = [
        `${client.users.cache.size} users`
      ];
      if (index === arrayOfStatus.length) index = 0;
      const status = arrayOfStatus[index];
      //console.log(status);
      client.user.setActivity(status, { type: "WATCHING" })
      index++;
    }, 5000);
});

process.on('unhandledRejection', async (reason, p, origin) => {
    try {
        const embed = new Discord.MessageEmbed()
            .setTitle('Error Occured')
            .setColor('RANDOM')
            .setDescription(`\`\`\`js\n${reason.stack}\nUser ID: ${p.params?.id || 'N/A'}\n${reason}\`\`\``);
        await client.channels.cache.get('988140784807202886')?.send({ embeds: [embed] });
    } catch (e) {
        console.log('Failed to send error to channel:', e.message);
    }
});

process.on('uncaughtExceptionMonitor', async (err, origin) => {
    console.log('Unhandled Exception:', err);
    try {
        const embed = new Discord.MessageEmbed()
            .setTitle('Error Occured')
            .setColor('RANDOM')
            .setDescription(`\`\`\`js\n${err.stack}\nUser ID: ${origin.params?.id || 'N/A'}\n${err}\`\`\``);
        await client.channels.cache.get('988140784807202886')?.send({ embeds: [embed] });
    } catch (e) {
        console.log('Failed to send error to channel:', e.message);
    }
});

// console.log(`http://localhost:3001/api/card/784141856426033233`)
// console.log(`http://localhost:3001/api/compact/784141856426033233`)

client.on("rateLimit", data => {
    console.log('Rate limited:', data);
    process.exit(1);
})

client.on('rateLimited', () => {
    console.log('Rate limited');
    process.exit(1);
});

const { get } = require("https");

function ratelimit() {
    setInterval(() => {
        get(`https://discord.com/api/v10/gateway`, ({ statusCode }) => {
            if (statusCode == 429) {
                console.log('Gateway rate limited');
            }
        });
    }, 60 * 5 * 1000);
}

ratelimit();

// client.login(process.env.DISCORD_TOKEN)
// server.listen(process.env.PORT || serverPort, () => console.log(`Listening on port ${process.env.PORT || serverPort}`))

function loginWithRetry(retries = 5, delay = 10000) {
    client.login(process.env.DISCORD_TOKEN).then(() => {
        console.log('Logged in!');
    }).catch((err) => {
        console.log(`Login failed: ${err.message}`);
        if (retries > 0) {
            console.log(`Retrying login in ${delay / 1000} seconds... (${retries} retries left)`);
            setTimeout(() => loginWithRetry(retries - 1, delay), delay);
        } else {
            console.log('Max retries reached. Exiting.');
            process.exit(1);
        }
    });
}

server.listen(port, () => {
    console.log(`Listening on port ${port}`)
    setTimeout(() => loginWithRetry(), 10000); // Wait 10 seconds before login to avoid rate limits
})