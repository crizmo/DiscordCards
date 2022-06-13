const express = require('express');
const request = require('request');
const app = express();
const fs = require('fs');

const { Client, Intents, Collection } = require('discord.js');
const Discord = require('discord.js');
const client = new Client({ intents: 32767 });
require('dotenv').config();

const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"],
    }
})

io.on("connection", (socket) => {
    console.log(`a user connected ${socket.id}`)

    socket.on("user", function (data) {
        const main_user = data.userid

        const member = client.guilds.cache.get('939799133177384990').members.cache.get(data.userid);
        const activity = member.presence.activities[0];
        // console.log(activity)

        let temp = fs.readFileSync('./assets/discord-card.svg', {encoding: 'utf-8'}).toString()
        temp = temp.replace('[name]', activity.name);
        temp = temp.replace('[details]', activity.details);
        temp = temp.replace('[state]', activity.state);
        temp = temp.replace('[type]', activity.type);
        // temp = temp.replace('[button-text]', activity.buttons[0]);
        // console.log(temp)

        let base64 = Buffer.from(temp).toString('base64');
        console.log(base64)

        io.emit("message", {
            stuff: activity,
            card: temp,
            baseimg: base64
        })

        function getActivity() {
            const member = client.guilds.cache.get('939799133177384990').members.cache.get(data.userid);
            const activity = member.presence.activities[0];
            // console.log(activity)

            let temp = fs.readFileSync('./assets/discord-card.svg', {encoding: 'utf-8'}).toString()
            temp = temp.replace('[name]', activity.name);
            temp = temp.replace('[details]', activity.details);
            temp = temp.replace('[state]', activity.state);
            temp = temp.replace('[type]', activity.type);
            temp = temp.replace('[button-text]', activity.buttons[0]);

            let base64 = Buffer.from(temp).toString('base64');
            // console.log(base64)

            io.emit("message", {
                stuff: activity,
                card: temp,
                baseimg: base64
            })
        }

        client.on("presenceUpdate", function (newPresence) {
            if (newPresence.user.id === main_user) {
                getActivity()
                console.log(newPresence.activities[0].state)
            }
        });
    })
})

io.on("disconnect", (socket) => {
    console.log(`a user disconnected ${socket.id}`)
}
)

server.listen(3001, () => console.log(`Listening on port 3001`))
client.login(process.env.DISCORD_TOKEN);