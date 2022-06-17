const express = require('express');
const app = express();
const onlysvg = express();
const fs = require('fs');

const { Client, Intents, Collection } = require('discord.js');
const Discord = require('discord.js');
const client = new Client({ intents: 32767 });
require('dotenv').config();

const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors');
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
        const activity = member.presence.activities[0]

        let discord_avatar = member.user.displayAvatarURL({format: 'png', dynamic: true, size: 1024})
        let spotify_logo = 'https://www.freeiconspng.com/uploads/spotify-icon-0.png'

        let temp;
        if (activity.name === 'Spotify') {
            let start = activity.timestamps.start
            let end = activity.timestamps.end
            let elapsed = end - start
            let minutes = Math.floor(elapsed / 60000)
            let seconds = Math.floor((elapsed % 60000) / 1000)
            let timeString = `${minutes}:${seconds}` 

            let time = 0;

            temp = fs.readFileSync('./assets/spotify-card.svg', {encoding: 'utf-8'}).toString()
            temp = temp.replace('[details]', activity.details);
            temp = temp.replace('[state]', activity.state);
            temp = temp.replace('[type]', activity.type);
            temp = temp.replace('[on]', activity.assets.largeText);
            temp = temp.replace('[time]', time + ' -- ' + timeString);
            temp = temp.replace('[discord-pfp]', discord_avatar);
            temp = temp.replace('[spotify-logo]', spotify_logo);
            temp = temp.replace('[button-text]', "Play on Spotify");
        } else if (activity.name === 'Code') {

            let time = activity.timestamps.start;
            let elapsed = Date.now() - time;
            let minutes = Math.floor(elapsed / 60000);
            let seconds = Math.floor((elapsed % 60000) / 1000);
            let timeString = `${minutes}:${seconds}`;
            
            const largeimage = activity.assets.largeImage
            let largelink = largeimage.split('raw')[1]
            const rawlarge = 'https://raw' + largelink

            const smallimage = activity.assets.smallImage
            let smallink = smallimage.split('raw')[1]
            const rawsmall = 'https://raw' + smallink

            temp = fs.readFileSync('./assets/vscode-card.svg', {encoding: 'utf-8'}).toString()
            temp = temp.replace('[name]', activity.name);
            temp = temp.replace('[details]', activity.details);
            temp = temp.replace('[state]', activity.state);
            temp = temp.replace('[type]', activity.type);
            temp = temp.replace('[time]', timeString + ' elapsed');
            temp = temp.replace('[large-image]', rawlarge);
            temp = temp.replace('[small-image]', rawsmall);
            temp = temp.replace('[button-text]', activity.buttons[0]);
        }

        let base64 = Buffer.from(temp).toString('base64');

        io.emit("message", {
            stuff: activity,
            card: temp,
            baseimg: base64
        })

        function getActivity() {
            const member = client.guilds.cache.get('939799133177384990').members.cache.get(data.userid);
            const activity = member.presence.activities[0];

            let temp;
            if (activity.name === 'Spotify') {
                let start = activity.timestamps.start
                let end = activity.timestamps.end
                let elapsed = end - start
                let minutes = Math.floor(elapsed / 60000)
                let seconds = Math.floor((elapsed % 60000) / 1000)
                let timeString = `${minutes}:${seconds}` 

                let time = 0;

                temp = fs.readFileSync('./assets/spotify-card.svg', {encoding: 'utf-8'}).toString()
                temp = temp.replace('[details]', activity.details);
                temp = temp.replace('[state]', activity.state);
                temp = temp.replace('[type]', activity.type);
                temp = temp.replace('[on]', activity.assets.largeText);
                temp = temp.replace('[discord-pfp]', discord_avatar);
                temp = temp.replace('[spotify-logo]', spotify_logo);
                temp = temp.replace('[time]', time + ' -- ' + timeString);
                temp = temp.replace('[button-text]', "Play on Spotify");
            } else if (activity.name === 'Code') {

                let time = activity.timestamps.start;
                let elapsed = Date.now() - time;
                let minutes = Math.floor(elapsed / 60000);
                let seconds = Math.floor((elapsed % 60000) / 1000);
                let timeString = `${minutes}:${seconds}`;
                
                const largeimage = activity.assets.largeImage
                let largelink = largeimage.split('raw')[1]
                const rawlarge = 'https://raw' + largelink

                const smallimage = activity.assets.smallImage
                let smallink = smallimage.split('raw')[1]
                const rawsmall = 'https://raw' + smallink

                temp = fs.readFileSync('./assets/vscode-card.svg', {encoding: 'utf-8'}).toString()
                temp = temp.replace('[name]', activity.name);
                temp = temp.replace('[details]', activity.details);
                temp = temp.replace('[state]', activity.state);
                temp = temp.replace('[type]', activity.type);
                temp = temp.replace('[time]', timeString + ' elapsed');
                temp = temp.replace('[large-image]', rawlarge);
                temp = temp.replace('[small-image]', rawsmall);
                temp = temp.replace('[button-text]', activity.buttons[0]);
            }

            let base64 = Buffer.from(temp).toString('base64');

            fs.writeFileSync('./assets/tempcard.svg', temp)

            io.emit("message", {
                stuff: activity,
                card: temp,
                baseimg: base64
            })
        }

        client.on("presenceUpdate", function (newPresence, oldPresence) {
            try {
                if (newPresence.user.bot) {
                    return;
                }
            } catch (e) {
                return;
            }
            if (newPresence.user.id === main_user) {
                if (newPresence.activities[0].name === 'Spotify') {
                    if(newPresence.activities[0].details === oldPresence.activities[0].details) {
                        return;
                    } else {
                        getActivity()
                    }
                } else if (newPresence.activities[0].name === 'Code') {
                    getActivity()
                }
            }
        });
    })
})

onlysvg.get('/svg', (req, res) => {
    const image = fs.readFileSync('./assets/tempcard.svg')
    res.writeHead(200, {'Content-Type': 'image/svg+xml'})
    res.end(image)
})

onlysvg.get('/svgimg/:id', (req, res) => {

    const member = client.guilds.cache.get('939799133177384990').members.cache.get(req.params.id);
    console.log(member)

    let activity
    let discord_avatar = member.user.displayAvatarURL({format: 'png', dynamic: true, size: 1024})
    let spotify_logo = 'https://www.freeiconspng.com/uploads/spotify-icon-0.png'

    try {
        activity = member.presence.activities[0];
        // console.log(activity)
    } catch (error) {
        res.send('No activity')
        return;
    }
    
    let temp;
    if (activity.name === 'Spotify') {

        let start = activity.timestamps.start
        let end = activity.timestamps.end
        let elapsed = end - start
        let minutes = Math.floor(elapsed / 60000)
        let seconds = Math.floor((elapsed % 60000) / 1000)
        let timeString = `${minutes}:${seconds}` 

        let time = 0;

        temp = fs.readFileSync('./assets/spotify-card.svg', {encoding: 'utf-8'}).toString()
        temp = temp.replace('[details]', activity.details.replace(/&/g, '&amp;'));
        temp = temp.replace('[state]', activity.state.replace(/&/g, '&amp;'));
        temp = temp.replace('[type]', activity.type);
        temp = temp.replace('[on]', activity.assets.largeText.replace(/&/g, '&amp;'));
        temp = temp.replace('[time]', time + ' -- ' + timeString);
        temp = temp.replace('[discord-pfp]', discord_avatar);
        temp = temp.replace('[spotify-logo]', spotify_logo);
        temp = temp.replace('[button-text]', "Play on Spotify");
    } else if (activity.name === 'Code') {

        let time = activity.timestamps.start;
        let elapsed = Date.now() - time;
        let minutes = Math.floor(elapsed / 60000);
        let seconds = Math.floor((elapsed % 60000) / 1000);
        let timeString = `${minutes}:${seconds}`;
        
        const largeimage = activity.assets.largeImage
        let largelink = largeimage.split('raw')[1]
        const rawlarge = 'https://raw' + largelink

        const smallimage = activity.assets.smallImage
        let smallink = smallimage.split('raw')[1]
        const rawsmall = 'https://raw' + smallink

        temp = fs.readFileSync('./assets/vscode-card.svg', {encoding: 'utf-8'}).toString()
        temp = temp.replace('[name]', activity.name);
        temp = temp.replace('[details]', activity.details);
        temp = temp.replace('[state]', activity.state);
        temp = temp.replace('[type]', activity.type);
        temp = temp.replace('[time]', timeString + ' elapsed');
        temp = temp.replace('[large-image]', rawlarge);
        temp = temp.replace('[small-image]', rawsmall);
        temp = temp.replace('[button-text]', activity.buttons[0]);
    }
    res.writeHead(200, {'Content-Type': 'image/svg+xml'})
    res.end(temp)

})

io.on("disconnect", (socket) => {
    console.log(`a user disconnected ${socket.id}`)
}
)

server.listen(3001, () => console.log(`Listening on port 3001`))
onlysvg.listen(5000, () => console.log(`Listening on port 5000 \nhttp://localhost:5000/svgimg/784141856426033233`))
client.login(process.env.DISCORD_TOKEN);