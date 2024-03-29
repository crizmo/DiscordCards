const express = require('express');
const router = express.Router();

const fs = require('fs');
const imageToBase64 = require('image-to-base64');

const { Client } = require('discord.js');
const client = new Client({ intents: 32767 });
require('dotenv').config();

const api_xomp = () => {

    router.get('/:id', async (req, res) => {
        // let startTime = Date.now();

        let member
        try {
            member = await client.guilds.cache.get("782646778347388959").members.fetch(req.params.id);
            if (member.user.bot) {
                res.send("User is a bot")
                return
            }
        } catch (e) {

            let html = `
            <html>
            <head>
            <title>User not found</title>
            </head>
            <body>
            <h3>User not found</h3>
            <p>User id: ${req.params.id}</p>
            <p>If the user is not in the DrunkBetch server, please add them to the server and try again</p>
            <a href="https://discord.gg/Ecy6WpEZsD">Join the DrunkBetch server</a>
            <p>If the user is in the server, please try reloading the page</p>
            </body>
            </html>
            `

            res.send(html)
            return;
        }

        let discord_avatar, banner, about
        let activity, name, type, details, state
        let large_image, small_image
        let smallimg, largeimg, raw // for PLaying
        let largeText // for Spotify

        let hex
        let temp_large, temp_small

        let pfp64, banner64
        // let spotify64
        let large64, small64

        try {
            discord_avatar = member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })
            banner = req.query.banner
            about = req.query.about || ' '
            if (about.length > 22) {
                about = about.substring(0, 22) + "..."
            }
            

            temp_small = "https://cdn.discordapp.com/attachments/988140784807202886/991310761991360512/small_breeze.png"
            large_image = req.query.large_image || discord_avatar
            small_image = req.query.small_image || temp_small

            hex = req.query.hex || '4E545B'
        } catch (e) {
            res.send('Uh user error')
            console.log(e)
            return;
        }

        try {
            pfp64 = await imageToBase64(discord_avatar)
            pfp64 = `data:image/png;base64,${pfp64}`

            if (banner) {
                banner64 = await imageToBase64(banner)
                banner64 = `data:image/png;base64,${banner64}`
            } else {
                banner64 = " "
            }

            if(req.query.large_image) {
                large64 = large_image
                large64 = await imageToBase64(large64)
                large64 = `data:image/png;base64,${large64}`
            } else {
                large64 = pfp64
            }
            
            if(req.query.small_image) {
                small64 = small_image
                small64 = await imageToBase64(small64)
                small64 = `data:image/png;base64,${small64}`
            } else {
                small64 = await imageToBase64(temp_small)
                small64 = `data:image/png;base64,${small64}`
            }

        } catch (e) {
            console.log(e)
        }
        
        try {
            if(member.presence.activities[0].id === 'custom' && !member.presence.activities[1]){
                no_activity()
                return;
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
            let temp;
            function no_activity() {
                try {
                    type = req.query.type || 'Discord Cards'
                    details = req.query.details || 'No Activity'

                    if (type.length > 17) {
                        type = type.substring(0, 17) + "..."
                    }
                    if (details.length > 17) {
                        details = details.substring(0, 17) + "..."
                    }
                } catch (e) {
                    type = 'Discord Cards'
                    details = 'No Activity'
                }

                temp = fs.readFileSync('./assets/updated/small.svg', {encoding: 'utf-8'}).toString()
                temp = temp.replace('[pfp]', pfp64);
                temp = temp.replace('[banner]', banner64);

                temp = temp.replace('[about]', about);
                temp = temp.replace('[type]', type);
                temp = temp.replace('[details]', details);
                temp = temp.replace('[state]', 'on Discord');
                temp = temp.replace('[on]', ' ');
                temp = temp.replace('[time]', ' ');

                temp = temp.replace('[large-image]', large64);
                temp = temp.replace('[small-image]', small64);
                // temp = temp.replace('[logo]', pfp64);

                temp = temp.replace('[button-text]', "Chilling");

                temp = temp.replace('[hex]', hex);

                res.writeHead(200, {'Content-Type': 'image/svg+xml'})
                res.end(temp)
            }
            no_activity()
            return;
        }

        if(!activity.name){
            name = 'No name'
        } else {
            name = activity.name.replace(/&/g, '&amp;');
            if (name.length > 17) {
                name = name.substring(0, 17) + '...';
            }
        }
        
        if(!activity.details){
            details = req.query.details || 'No details'
            if (details.length > 25) {
                details = details.substring(0, 25) + '...';
            }
        } else {
            details = activity.details.replace(/&/g, '&amp;')
            if (details.length > 25) {
                details = details.substring(0, 25) + '...';
            }
        }
        
        if(!activity.state){
            state = req.query.state || 'No state'
            if (state.length > 22) {
                state = state.substring(0, 22) + '...';
            }
        } else {
            state = activity.state.replace(/&/g, '&amp;')
            if (state.length > 22) {
                state = state.substring(0, 22) + '...';
            }
        }
        
        if(!activity.type){
            type = req.query.type || 'No type'
            if (type.length > 19) {
                type = type.substring(0, 19) + '...';
            }
        } else {
            type = activity.type.replace(/&/g, '&amp;')
            if (type.length > 19) {
                type = type.substring(0, 19) + '...';
            }
        }
        
        let temp;
        temp = fs.readFileSync('./assets/updated/small.svg', {encoding: 'utf-8'}).toString()
        if (activity.name === 'Spotify') {
            
            let start = activity.timestamps.start
            let end = activity.timestamps.end
            let elapsed = end - start
            let minutes = Math.floor(elapsed / 60000)
            let seconds = Math.floor((elapsed % 60000) / 1000)
            let timeString = `${minutes}:${seconds}` 

            if(!activity.assets){
                largeText = req.query.large_text || 'No large text'
            } else if(activity.assets.largeText === null) {
                largeText = req.query.large_text || 'No large text'
            } else {
                largeText = activity.assets.largeText.replace(/&/g, '&amp;');
                if (largeText.length > 17) {
                    largeText = largeText.substring(0, 17) + '...';
                }
            }

            let logo64 = fs.readFileSync('./assets/logos/spotify.txt', { encoding: 'utf-8' }).toString()

            temp = temp.replace('[banner]', banner64);
            
            temp = temp.replace('[about]', about);
            temp = temp.replace('[details]', details);
            temp = temp.replace('[state]', state);
            temp = temp.replace('[type]', type || 'Vibing');
            temp = temp.replace('[on]', largeText);
            temp = temp.replace('[time]', 'Time -  ' + timeString);
            
            temp = temp.replace('[large-image]', large64);
            temp = temp.replace('[small-image]', small64);
            temp = temp.replace('[logo]', logo64);
            
            temp = temp.replace('[button-text]', "Play on Spotify");

            temp = temp.replace('[hex]', hex);

        } else if (activity.name === 'Code' || activity.name === 'Visual Studio Code' ) {
            let time = activity.timestamps.start;
            let elapsed = Date.now() - time;
            let hours = Math.floor(elapsed / 3600000);
            let minutes = Math.floor((elapsed % 3600000) / 60000);
            let seconds = Math.floor((elapsed % 60000) / 1000);
            let timeString = `${hours}:${minutes}:${seconds}`;
            
            let largeimage , smallimage, rawlarge, rawsmall, large64, small64;

            if(activity.assets != null) {
                largeimage = activity.assets.largeImage
                let largelink = largeimage.split('raw')[1]
                rawlarge = 'https://raw' + largelink
                large64 = await imageToBase64(rawlarge)
                large64 = `data:image/png;base64,${large64}`
            } else {
                large64 = pfp64
            }

            if(activity.assets != null) {
                smallimage = activity.assets.smallImage
                let smallink = smallimage.split('raw')[1]
                rawsmall = 'https://raw' + smallink
            } else {
                rawsmall = 'https://cdn.discordapp.com/attachments/988140784807202886/1086221722807713812/vs_large.png'
            }

            small64 = await imageToBase64(rawsmall)
            small64 = `data:image/png;base64,${small64}`

            temp = temp.replace('[banner]', banner64);
            
            temp = temp.replace('[about]', about);
            temp = temp.replace('[type]', type || 'Coding');
            temp = temp.replace('[name]', activity.name || 'Coding');
            temp = temp.replace('[details]', name || 'Coding');
            temp = temp.replace('[state]', details || 'No details');
            temp = temp.replace('[on]', state || 'No description');
            temp = temp.replace('[time]', timeString + ' elapsed' || '0:00 elapsed');

            temp = temp.replace('[large-image]', large64);
            temp = temp.replace('[small-image]', small64);
            temp = temp.replace('[logo]', small64);

            temp = temp.replace('[button-text]', activity.buttons[0] || 'Working on Code');
            temp = temp.replace('[hex]', hex);

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

            if (!activity.assets && req.query.large_image == undefined) {
                raw = pfp64
            } else if (activity.assets) {
                if (activity.assets.smallImage !== null) {
                    if (activity.assets.smallImage.startsWith('mp:external') && activity.assets.smallImage !== null) {
                        smallimg = activity.assets.smallImage
                        let smalllink = smallimg.split('https/')[1]
                        small64 = 'https://' + smalllink
                        small64 = await imageToBase64(small64)
                        small64 = `data:image/png;base64,${small64}`
                    } else {
                        small64 = pfp64
                    }
                } 
                if (activity.assets.largeImage !== null) {
                    if (activity.assets.largeImage.startsWith('mp:external')) {
                        largeimg = activity.assets.largeImage
                        let largelink = largeimg.split('https/')[1]
                        raw = 'https://' + largelink
                        raw = await imageToBase64(raw)
                        raw = `data:image/png;base64,${raw}`
                    } else {
                        raw = pfp64
                    }
                }
            } else {
                raw = req.query.large_image
            }

            temp = temp.replace('[banner]', banner64);
            temp = temp.replace('[pfp]', pfp64);
            
            temp = temp.replace('[about]', about);
            temp = temp.replace('[type]', type || 'Playing');
            temp = temp.replace('[name]', name || 'Gaming');
            temp = temp.replace('[details]',name);
            temp = temp.replace('[state]', details);
            temp = temp.replace('[on]', state);
            temp = temp.replace('[time]', timeString + ' elapsed' || '0:00 elapsed');

            temp = temp.replace('[button-text]', activity.buttons[0] || 'Playing');

            temp = temp.replace('[large-image]', raw);
            temp = temp.replace('[small-image]', small64);
            // temp = temp.replace('[logo]', small64);
            temp = temp.replace('[hex]', hex);
        }
        
        res.writeHead(200, {'Content-Type': 'image/svg+xml'})
        res.end(temp)
        // console.log(`Card generated in ${Date.now() - startTime}ms`);
    })
}

api_xomp()
module.exports = router;
client.login(process.env.DISCORD_TOKEN);