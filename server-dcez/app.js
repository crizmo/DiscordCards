const express = require('express');
const app = express();

const { Client } = require('discord.js');
const Discord = require('discord.js');
const client = new Client({ intents: 32767 });
require('dotenv').config();

const args = process.argv.slice(2);
let port = process.env.PORT || 3001;
if (args.length > 0 && args[0] === '--port') {
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
    const embed = new Discord.MessageEmbed()
        .setTitle('Error Occured')
        .setColor('RANDOM')
        .setDescription(`\`\`\`js\n${reason.stack}\nUser ID: ${p.params.id}\n${reason}\`\`\``);
    client.channels.cache.get('988140784807202886').send({ embeds: [embed] })
});

process.on('uncaughtExceptionMonitor', async (err, origin) => {
    console.log('Unhandled Rejection at: err:', err, 'origin:', origin);
    const embed = new Discord.MessageEmbed()
        .setTitle('Error Occured')
        .setColor('RANDOM')
        .setDescription(`\`\`\`js\n${err.stack}\nUser ID: ${origin.params.id}\n${err}\`\`\``);
    client.channels.cache.get('988140784807202886').send({ embeds: [embed] })
});

// console.log(`http://localhost:3001/api/card/784141856426033233`)
// console.log(`http://localhost:3001/api/compact/784141856426033233`)

client.on("rateLimit", data => {
    process.exit(1)
})

client.on('rateLimited', () => {
    process.exit(1);
});

const { get } = require("https");

function ratelimit() {
    setInterval(() => {
        get(`https://discord.com/api/v10/gateway`, ({ statusCode }) => {
            if (statusCode == 429) {
                process.exit(1);
            }
        });
    }, 60 * 5 * 1000);
}

ratelimit();

// client.login(process.env.DISCORD_TOKEN)
// server.listen(process.env.PORT || serverPort, () => console.log(`Listening on port ${process.env.PORT || serverPort}`))

server.listen(port, () => {
    console.log(`Listening on port ${port}`)
    client.login(process.env.DISCORD_TOKEN).then(() => {
        console.log('Logged in!');
    }).catch((err) => {
        console.log(err);
    })
})