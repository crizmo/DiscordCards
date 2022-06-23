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

const serverPort = process.env.PORT || 3001;
const apiPort = process.env.PORT || 5000;

io.on("connection", async (socket) => {
    console.log(`a user connected ${socket.id}`)

    socket.on("user", async function (data) {
        const main_user = data.userid
        let about = data.about
        if(!about) {
            about = " "
        } else {
            about = data.about
            if (about.length > 20) {
                about = about.substring(0, 20) + "..."
            }
        }
        let member 
        try {
            client.guilds.fetch("782646778347388959")
            member = client.guilds.cache.get('782646778347388959').members.cache.get(data.userid) || await client.guilds.cache.get("782646778347388959").members.fetch(data.userid);
            if (!member) {
                console.log('member not in server')
                io.emit('not-in-server', {
                    userid: data.userid
                })
                return 
            }
        } catch (error) {
            console.log(error)
        }
        let activity
        try {
            if(member.presence.activities[0].id === 'custom' && !member.presence.activities[1]){
                no_activity()
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
            let temp

            let discord_avatar, username, banner, about
            let large_image , small_image , side_image
                
            try {
                discord_avatar = member.user.displayAvatarURL({format: 'png', dynamic: true})
                username = member.user.username + '#' + member.user.discriminator
                banner = data.banner || 'https://cdn.discordapp.com/attachments/970974282681307187/987323350709862420/green-back.png'
                about = data.about || ' '
    
                if (about.length > 20) {
                    about = about.substring(0, 20) + "..."
                }
            } catch (e) {
                console.log(e)
                return;
            }

            if(!data.large_image){
                large_image = discord_avatar
            } else {
                large_image = data.large_image
            }

            if(!data.small_image){
                small_image = discord_avatar
            } else {
                small_image = data.small_image
            }

            if(!data.side_image){
                side_image = discord_avatar
            } else {
                side_image = data.side_image
            }

            function no_activity() {
                let type, details
                type = 'Chilling'
                details = 'Vibing'

                temp = fs.readFileSync('./assets/cards/no-activity-new.svg', {encoding: 'utf-8'}).toString()
                temp = temp.replace('[pfp]', discord_avatar);
                temp = temp.replace('[username]', username);
                temp = temp.replace('[banner]', banner);
                temp = temp.replace('[about]', about);

                temp = temp.replace('[type]', type);
                temp = temp.replace('[details]', details);

                temp = temp.replace('[large-image]', large_image || discord_avatar)
                temp = temp.replace('[small-image]', small_image || discord_avatar)
                temp = temp.replace('[side-image]', discord_avatar)

                console.log(`${member.user.username} has no activity`)

                io.emit('no-activity', {
                    userid: data.userid,
                    card: temp
                })
        
            }
            no_activity()
            return;
        }
        
        let discord_avatar, username, banner
        let play_along, spotify_logo
        
        try {
            discord_avatar = member.user.displayAvatarURL({format: 'png', dynamic: true})
            spotify_logo = 'https://www.freeiconspng.com/uploads/spotify-icon-0.png'
            username = member.user.username + '#' + member.user.discriminator
            banner = data.banner || 'https://cdn.discordapp.com/attachments/970974282681307187/987323350709862420/green-back.png'
            about = data.about || ' '

            if (about.length > 20) {
                about = about.substring(0, 20) + "..."
            }

            play_along = "https://cdn.discordapp.com/attachments/970974282681307187/987330240609132555/play-along.png"
        } catch (e) {
            console.log(e)
            return;
        }
        
        let name, details, state, smallimg, raw, largeText
        let large_image, small_image

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

        if(!data.large_image){
            large_image = raw
        } else {
            large_image = data.large_image
        }

        if(!data.small_image){
            small_image = raw
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

            let time = 0;

            temp = fs.readFileSync('./assets/cards/spotify-new.svg', {encoding: 'utf-8'}).toString()
            temp = temp.replace('[username]', username);
            temp = temp.replace('[banner]', banner);
            temp = temp.replace('[about]', about);

            temp = temp.replace('[play-along]', play_along);

            temp = temp.replace('[details]', details);
            temp = temp.replace('[state]', state);
            temp = temp.replace('[type]', activity.type);
            temp = temp.replace('[on]', largeText);
            temp = temp.replace('[time]', time + ' -- ' + timeString);
            temp = temp.replace('[pfp]', discord_avatar);       
            temp = temp.replace('[large-image]', large_image || discord_avatar);
            temp = temp.replace('[small-image]', small_image || spotify_logo);
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

            temp = fs.readFileSync('./assets/cards/vscode-new.svg', {encoding: 'utf-8'}).toString()
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
            // console.log(activity)
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
            
            temp = fs.readFileSync('./assets/cards/game-new.svg', {encoding: 'utf-8'}).toString()
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

        let base64
        try {
            base64 = Buffer.from(temp).toString('base64');
        } catch (error) {
            console.log(error)
        }

        io.emit("message", {
            stuff: activity,
            card: temp,
            baseimg: base64
        })

        function getActivity() {
            client.guilds.fetch("782646778347388959")
            const member = client.guilds.cache.get('782646778347388959').members.cache.get(data.userid);
            // console.log(member.presence.activities[0])
            let activity
            try {
                if (member.presence.activities[0].id === 'custom' || member.presence.activities[0].type === 'CUSTOM') {
                    activity = member.presence.activities[1];
                } else {
                    try {
                        activity = member.presence.activities[0];
                        // console.log(activity)
                    } catch (error) {
                        res.send('No activity')
                        return;
                    }
                }
            } catch (e) {
                console.log(e)
                return;
            }

            let name, details, state, smallimg, raw, largeText
            let large_image, small_image

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

            if(!activity.assets){
                raw = discord_avatar
            } else if(activity.assets.smallImage === null) {
                raw = discord_avatar
            } else if(activity.assets.smallImage.startsWith('mp:external')){
                smallimg = activity.assets.smallImage
                let smalllink = smallimg.split('https/')[1]
                raw = 'https://' + smalllink
            } else {
                raw = discord_avatar   
            }

            if(!data.large_image){
                large_image = raw
            } else {
                large_image = data.large_image
            }
    
            if(!data.small_image){
                small_image = raw
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

                let time = 0;

                temp = fs.readFileSync('./assets/cards/spotify-new.svg', {encoding: 'utf-8'}).toString()
                temp = temp.replace('[username]', username);
                temp = temp.replace('[banner]', banner);
                temp = temp.replace('[about]', about);
        
                temp = temp.replace('[play-along]', play_along);
        
                temp = temp.replace('[details]', details);
                temp = temp.replace('[state]', state);
                temp = temp.replace('[type]', activity.type);
                temp = temp.replace('[on]', largeText);
                temp = temp.replace('[time]', time + ' -- ' + timeString);
                temp = temp.replace('[pfp]', discord_avatar);
                temp = temp.replace('[large-image]', large_image || raw);
                temp = temp.replace('[small-image]', small_image || raw);
                temp = temp.replace('[spotify-logo]', spotify_logo);
                temp = temp.replace('[button-text]', "Play on Spotify");
            } else if (activity.name === 'Code' || activity.name === 'Visual Studio Code') {

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

                temp = fs.readFileSync('./assets/cards/vscode-new.svg', {encoding: 'utf-8'}).toString()
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
                temp = temp.replace('[button-text]', activity.buttons[0] || 'View Repository' );
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
        
                temp = fs.readFileSync('./assets/cards/game-new.svg', {encoding: 'utf-8'}).toString()
                temp = temp.replace('[username]', username);
                temp = temp.replace('[banner]', banner);
                temp = temp.replace('[about]', about);
                temp = temp.replace('[pfp]', discord_avatar);
        
                temp = temp.replace('[name]', name || 'Gaming');
                temp = temp.replace('[details]', details || ' ');
                temp = temp.replace('[state]', state || ' ');
                temp = temp.replace('[type]', activity.type || 'PLAYING');
                temp = temp.replace('[large-image]', large_image || raw);
                temp = temp.replace('[small-image]', small_image || raw);
                temp = temp.replace('[time]', timeString + ' elapsed' || '0:00 elapsed');
            }

            let base64 = Buffer.from(temp).toString('base64');

            // fs.writeFileSync('./assets/tempcard.svg', temp)

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
                } else if (newPresence.activities[0].name === 'Code' || newPresence.activities[0].name === 'Visual Studio Code') {
                    getActivity()
                } else if (newPresence.activities[0].type === 'PLAYING') {
                    getActivity()
                }
            } 
            // else {
            //     return;
            // }
        });
    })
})

io.on("disconnect", (socket) => {
    console.log(`a user disconnected ${socket.id}`)
})

process.on('unhandledRejection', async (reason, p, origin) => {
    const embed = new Discord.MessageEmbed()
        .setTitle('Error Occured')
        .setColor('RANDOM')
        .setDescription('```js\n' + reason.stack + '```');
    client.channels.cache.get('988140784807202886').send({ embeds: [embed] })
});

process.on('uncaughtExceptionMonitor', async (err, origin) => {
    const embed = new Discord.MessageEmbed()
        .setTitle('Error Occured')
        .setColor('RANDOM')
        .setDescription('```js\n' + err.stack + '```');
    client.channels.cache.get('988140784807202886').send({ embeds: [embed] })
});

const api = require('./lib/api')
onlysvg.use('/api', api)

server.listen(serverPort , () => console.log(`Listening on port 3001`))
onlysvg.listen(apiPort , () => console.log(`Listening on port 5000 \nhttp://localhost:5000/api/784141856426033233?about=pog&banner=https://wallpapercave.com/wp/wp4771870.jpg`))
client.login(process.env.DISCORD_TOKEN);