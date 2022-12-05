const express = require('express');
const app = express();
const fs = require('fs');

const { Client } = require('discord.js');
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
        origin: '*',
        methods: ["GET", "POST"],
    }
})

const serverPort = process.env.PORT || 3001;

const start = require('./lib/base_endpoints/start')
app.use('/', start)

const api = require('./lib/api')
app.use('/api/card', api)

const api_xomp = require('./lib/api_xomp')
app.use('/api/compact', api_xomp)

let requests = 0;
fs.readFile('./lib/requests.json', 'utf8', (err, data) => {
    if (err) {
        console.log(err);
    } else {
        const requestsData = JSON.parse(data);
        if (requestsData.requests) {
            requests = requestsData.requests;
        } else {
            requests = 0;
        }
    }
});
app.use('/requests', (req, res) => {
    res.send("Requests: " + requests);
})

io.on("connection", async (socket) => {
    console.log(`a user connected ${socket.id}`)

    socket.on("user", async function (data) {
        const main_user = data.user
        let member 
        try {
            client.guilds.fetch("782646778347388959")
            member = client.guilds.cache.get('782646778347388959').members.cache.get(main_user) || await client.guilds.cache.get("782646778347388959").members.fetch(main_user);
            if (!member) {
                console.log('member not in server')
                io.emit('not-in-server', {
                    user_id: data.user
                })
                return;
            }
        } catch (error) {
            console.log('member not in server')
            io.emit('not-in-server', {
                user_id: data.user
            })
            return;
        }
        let activity
        try {
            if(member.presence.activities[0].id === 'custom' && !member.presence.activities[1]){
                no_activity()
                return
            } else if (member.presence.activities[0].id === 'custom' || member.presence.activities[0].type === 'CUSTOM') {
                activity = member.presence.activities[1];
            } else {
                try {
                    activity = member.presence.activities[0];
                } catch (error) {
                    no_activity()
                    return;
                }
            }
        } catch (e) {
            no_activity()
            return;
        }
        
        let name, details, state, smallimg, raw, largeText
        let large_image, small_image
        let temp_large, temp_small

        let discord_avatar, username, banner, about
        let play_along, spotify_logo
        
        try {
            discord_avatar = member.user.displayAvatarURL({format: 'png', dynamic: true})
            spotify_logo = 'https://www.freeiconspng.com/uploads/spotify-icon-0.png'
            username = member.user.username + '#' + member.user.discriminator
            banner = data.banner || 'https://cdn.discordapp.com/attachments/988140784807202886/1009883353232719932/banner.png'
            about = data.about || ' '

            if (about.length > 20) {
                about = about.substring(0, 20) + "..."
            }

            play_along = "https://cdn.discordapp.com/attachments/970974282681307187/987330240609132555/play-along.png"
        } catch (e) {
            console.log(e)
            return;
        }
        

        try {
            temp_large = "https://cdn.discordapp.com/attachments/988140784807202886/991310693791965214/large_breeze.png"
            temp_small = "https://cdn.discordapp.com/attachments/988140784807202886/991310761991360512/small_breeze.png"
        } catch (e) {
            console.log(e)
            return;
        }

        if(!activity.name){
            name = ' '
        } else {
            name = activity.name.replace(/&/g, '&amp;');
            if (name.length > 23) {
                name = name.substring(0, 23) + '...';
            }
        }
        
        if(!activity.details){
            details = ' '
        } else {
            details = activity.details.replace(/&/g, '&amp;');
            if (details.length > 23) {
                details = details.substring(0, 23) + '...';
            }
        }

        if(!activity.state){
            state = ' '
        } else {
            state = activity.state.replace(/&/g, '&amp;');
            if (state.length > 23) {
                state = state.substring(0, 23) + '...';
            }
        }

        if(!data.large_image){
            large_image = temp_large 
        } else {
            large_image = data.large_image
        }

        if(!data.small_image){
            small_image = temp_small
        } else {
            small_image = data.small_image
        }

        let temp;
        if (activity.name === 'Spotify') {
            let start = activity.timestamps.start
            let end = activity.timestamps.end
            let elapsed = end - start
            let minutes = Math.floor(elapsed / 60000)
            let seconds = Math.floor((elapsed % 60000) / 1000)
            let timeString = `${minutes}:${seconds}` 

            if(!activity.assets){
                largeText = ' '
            } else if(activity.assets.largeText === null) {
                largeText = ' '
            } else {
                largeText = activity.assets.largeText.replace(/&/g, '&amp;');
                if (largeText.length > 23) {
                    largeText = largeText.substring(0, 23) + '...';
                }
            }

            temp = fs.readFileSync('./assets/cards/large/spotify-new.svg', {encoding: 'utf-8'}).toString()
            temp = temp.replace('[pfp]', discord_avatar);        
            temp = temp.replace('[username]', username);
            temp = temp.replace('[banner]', banner);
            
            
            temp = temp.replace('[about]', about);
            temp = temp.replace('[details]', details);
            temp = temp.replace('[state]', state);
            temp = temp.replace('[type]', activity.type);
            temp = temp.replace('[on]', largeText);
            temp = temp.replace('[time]', 'Time -  ' + timeString);
            
            temp = temp.replace('[large-image]', large_image);
            temp = temp.replace('[small-image]', small_image);
            
            temp = temp.replace('[play-along]', play_along);
            temp = temp.replace('[spotify-logo]', spotify_logo);
            temp = temp.replace('[button-text]', "Play on Spotify");
        } else if (activity.name === 'Code' || activity.name === 'Visual Studio Code') {

            let time = activity.timestamps.start;
            let elapsed = Date.now() - time;
            let hours = Math.floor(elapsed / 3600000);
            let minutes = Math.floor((elapsed % 3600000) / 60000);
            let seconds = Math.floor((elapsed % 60000) / 1000);
            let timeString = `${hours}:${minutes}:${seconds}`;
            
            const largeimage = activity.assets.largeImage
            let largelink = largeimage.split('raw')[1]
            const rawlarge = 'https://raw' + largelink

            const smallimage = activity.assets.smallImage
            let smallink = smallimage.split('raw')[1]
            const rawsmall = 'https://raw' + smallink

            temp = fs.readFileSync('./assets/cards/large/vscode-new.svg', {encoding: 'utf-8'}).toString()
            temp = temp.replace('[username]', username);
            temp = temp.replace('[banner]', banner);
            temp = temp.replace('[about]', about);
            temp = temp.replace('[pfp]', discord_avatar);

            temp = temp.replace('[name]', activity.name);
            temp = temp.replace('[details]', activity.details);
            temp = temp.replace('[state]', state);
            temp = temp.replace('[type]', activity.type);
            temp = temp.replace('[time]', timeString + ' elapsed');

            temp = temp.replace('[large-image]', rawlarge);
            temp = temp.replace('[small-image]', rawsmall);
            temp = temp.replace('[button-text]', activity.buttons[0] || 'View Repository');
        } else if (activity.type === 'PLAYING') {
            let time, elapsed, hours, minutes, seconds, timeString
            
            try {
                time = activity.timestamps.start;
                elapsed = Date.now() - time;
                hours = Math.floor(elapsed / 3600000);
                minutes = Math.floor((elapsed % 3600000) / 60000);
                seconds = Math.floor((elapsed % 60000) / 1000);
                timeString = `${hours}:${minutes}:${seconds}`;
            } catch (error) {
                timeString = '0:0:0'
            }

            if(!activity.assets){
                raw = discord_avatar
            } else if(activity.assets.smallImage === null) {
                raw = discord_avatar
            } else if(activity.assets.smallImage.startsWith('mp:external')){
                smallimg = activity.assets.smallImage
                let smalllink = smallimg.split('https/')[1]
                raw = 'https://' + smalllink
            } else {
                raw = data.large_image || discord_avatar  
            }
            
            temp = fs.readFileSync('./assets/cards/large/game-new.svg', {encoding: 'utf-8'}).toString()
            temp = temp.replace('[username]', username);
            temp = temp.replace('[banner]', banner);
            temp = temp.replace('[about]', about);
            temp = temp.replace('[pfp]', discord_avatar);
    
            temp = temp.replace('[name]', name || 'Gaming');
            temp = temp.replace('[details]', details || '');
            temp = temp.replace('[state]', state || ' ');
            temp = temp.replace('[type]', activity.type || 'PLAYING');
            temp = temp.replace('[large-image]', large_image || raw);
            temp = temp.replace('[small-image]', small_image || raw);
            temp = temp.replace('[time]', timeString || '0:00 elapsed');
        }
        io.emit("message", {
            stuff: activity,
            card: temp,
        })

        function no_activity() {
            let temp

            let discord_avatar, username, banner, about
            let large_image , small_image
            let temp_large, temp_small
            let type , details
                
            try {
                discord_avatar = member.user.displayAvatarURL({format: 'png', dynamic: true})
                username = member.user.username + '#' + member.user.discriminator
                banner = data.banner || 'https://media.discordapp.net/attachments/988140784807202886/991308628978061402/blue_boi.png'
                about = data.about || ' '
                temp_large = "https://cdn.discordapp.com/attachments/988140784807202886/991310693791965214/large_breeze.png"
                temp_small = "https://cdn.discordapp.com/attachments/988140784807202886/991310761991360512/small_breeze.png"

                if (about.length > 20) {
                    about = about.substring(0, 20) + "..."
                }
            } catch (e) {
                console.log(e)
                return;
            }

            if(!data.large_image){
                large_image = temp_large
            } else {
                large_image = data.large_image
            }

            if(!data.small_image){
                small_image = temp_small
            } else {
                small_image = data.small_image
            }

            if(!data.type){
                type = 'Chilling'
            } else {
                type = data.type
            }

            if(!data.details){
                details = 'Breeze'
            } else {
                details = data.details
            }

            temp = fs.readFileSync('./assets/cards/large/no-activity-new.svg', {encoding: 'utf-8'}).toString()
            temp = temp.replace('[pfp]', discord_avatar);
            temp = temp.replace('[username]', username);
            temp = temp.replace('[banner]', banner);
            temp = temp.replace('[about]', about);

            temp = temp.replace('[type]', type);
            temp = temp.replace('[details]', details);

            temp = temp.replace('[large-image]', large_image || discord_avatar)
            temp = temp.replace('[small-image]', small_image || discord_avatar)
            temp = temp.replace('[side-image]', discord_avatar)

            // console.log(`${member.user.username} has no activity`)

            io.emit('no-activity', {
                user_id: data.user,
                card: temp
            })
            return
        }
    })
})

io.on("disconnect", (socket) => {
    console.log(`a user disconnected ${socket.id}`)
})

process.on('unhandledRejection', async (reason, p, origin) => {
    const embed = new Discord.MessageEmbed()
        .setTitle('Error Occured')
        .setColor('RANDOM')
        .setDescription('```js\n' + reason.stack + reason + '```');
    client.channels.cache.get('988140784807202886').send({ embeds: [embed] })
});

process.on('uncaughtExceptionMonitor', async (err, origin) => {
    console.log('Unhandled Rejection at: err:', err, 'origin:', origin);
    const embed = new Discord.MessageEmbed()
        .setTitle('Error Occured')
        .setColor('RANDOM')
        .setDescription('```js\n' + err.stack + err + '```');
    client.channels.cache.get('988140784807202886').send({ embeds: [embed] })
});

server.listen(process.env.PORT || serverPort , () => console.log(`Listening on port ${process.env.PORT || serverPort}`))
// console.log(`http://localhost:3001/api/card/784141856426033233`)
// console.log(`http://localhost:3001/api/compact/784141856426033233`)
client.login(process.env.DISCORD_TOKEN);