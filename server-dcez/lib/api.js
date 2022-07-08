const express = require('express');
const router = express.Router();

const fs = require('fs');
const imageToBase64 = require('image-to-base64');

const { Client, Intents, Collection } = require('discord.js');
const client = new Client({ intents: 32767 });
require('dotenv').config();

const api = () => {

    router.get('/:id', async (req, res) => {

        /* queries = {
            banner: 'req.query.banner',
            about: 'req.query.about',
            type: 'req.query.type',
            large_image: 'req.query.large_image',
            small_image: 'req.query.small_image',
        } */

        /* base64 images
            pfp (discord_avatar),
            banner,
            spotify_logo,
            large_image,
            small_image,
            play_along,
            side image
        */

        let member
        try {
            member = await client.guilds.cache.get("782646778347388959").members.fetch(req.params.id);
            if (member.user.bot) {
                res.send("User is a bot")
                return
            }
        } catch (e) {
            res.send('User not found ! Please try again')
            // console.log(e)
            return;
        }

        let username , discord_avatar, banner, about
        let activity, name, type, details, state
        let large_image, small_image, side_image
        let smallimg, raw // for PLaying
        let spotify_logo, play_along, largeText // for Spotify

        let temp_large, temp_small, temp_side

        let pfp64, banner64
        let spotify64, play_along64
        let large64, small64, side64

        try {
            discord_avatar = member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })
            username = member.user.username + '#' + member.user.discriminator
            banner = req.query.banner || 'https://media.discordapp.net/attachments/988140784807202886/991308628978061402/blue_boi.png'
            about = req.query.about || ' '
            if (about.length > 20) {
                about = about.substring(0, 20) + "..."
            }
            
            spotify_logo = 'https://www.freeiconspng.com/uploads/spotify-icon-0.png'
            play_along = "https://cdn.discordapp.com/attachments/970974282681307187/987330240609132555/play-along.png"

            temp_large = "https://cdn.discordapp.com/attachments/988140784807202886/991310693791965214/large_breeze.png"
            temp_small = "https://cdn.discordapp.com/attachments/988140784807202886/991310761991360512/small_breeze.png"
            temp_side = discord_avatar

            large_image = req.query.large_image || temp_large
            small_image = req.query.small_image || temp_small
            side_image = req.query.side_image || temp_side

        } catch (e) {
            res.send('Uh user error')
            console.log(e)
            return;
        }

        try {
            pfp64 = await imageToBase64(discord_avatar)
            pfp64 = `data:image/png;base64,${pfp64}`

            banner64 = await imageToBase64(banner)
            banner64 = `data:image/png;base64,${banner64}`

            spotify64 = await imageToBase64(spotify_logo)
            spotify64 = `data:image/png;base64,${spotify64}`

            play_along64 = await imageToBase64(play_along)
            play_along64 = `data:image/png;base64,${play_along64}`

            large64 = large_image
            large64 = await imageToBase64(large64)
            large64 = `data:image/png;base64,${large64}`
            
            small64 = small_image
            small64 = await imageToBase64(small64)
            small64 = `data:image/png;base64,${small64}`
    
            side64 = side_image
            side64 = await imageToBase64(side64)
            side64 = `data:image/png;base64,${side64}`

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
                    type = req.query.type || 'Breeze'
                    details = req.query.details || 'Vibing'

                    if (type.length > 23) {
                        type = type.substring(0, 23) + "..."
                    }
                    if (details.length > 23) {
                        details = details.substring(0, 23) + "..."
                    }
                } catch (e) {
                    type = 'Breeze'
                    details = 'Vibing'
                }

                temp = fs.readFileSync('./assets/cards/large/no-activity-new.svg', {encoding: 'utf-8'}).toString()
                temp = temp.replace('[pfp]', pfp64);
                temp = temp.replace('[username]', username);
                temp = temp.replace('[banner]', banner64);
                temp = temp.replace('[about]', about);

                temp = temp.replace('[type]', type);
                temp = temp.replace('[details]', details);

                temp = temp.replace('[large-image]', large64);
                temp = temp.replace('[small-image]', small64);
                temp = temp.replace('[side-image]', side64);

                // res.send('User has no activity')
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
            if (name.length > 23) {
                name = name.substring(0, 23) + '...';
            }
        }
        
        if(!activity.details){
            details = 'No details'
        } else {
            details = activity.details.replace(/&/g, '&amp;') || req.query.details || 'No details'
            if (details.length > 23) {
                details = details.substring(0, 23) + '...';
            }
        }
        
        if(!activity.state){
            state = 'No description'
        } else {
            state = activity.state.replace(/&/g, '&amp;') || req.query.state || 'No description'
            if (state.length > 23) {
                state = state.substring(0, 23) + '...';
            }
        }

        if(!activity.type){
            type = req.query.type || 'Vibing'
        } else {
            type = activity.type.replace(/&/g, '&amp;')|| req.query.type || 'Vibing'
            if (type.length > 23) {
                type = type.substring(0, 23) + '...';
            }
        }
        
        if(!activity.assets){
            raw = req.query.large_image || pfp64
        } else if(activity.assets.smallImage === null) {
            raw = pfp64
        } else if(activity.assets.smallImage.startsWith('mp:external')){
            smallimg = activity.assets.smallImage
            let smalllink = smallimg.split('https/')[1]
            raw = 'https://' + smalllink
            raw = await imageToBase64(raw)
            raw = `data:image/png;base64,${raw}`
        } else {
            raw = req.query.large_image || pfp64
        }

        if(!activity.assets){
            largeText = req.query.large_text || 'No large text'
        } else if(activity.assets.largeText === null) {
            largeText = req.query.large_text || 'No large text'
        } else {
            largeText = activity.assets.largeText.replace(/&/g, '&amp;');
            if (largeText.length > 23) {
                largeText = largeText.substring(0, 23) + '...';
            }
        }

        large64 = req.query.large_image || large_image
        large64 = await imageToBase64(large64)
        large64 = `data:image/png;base64,${large64}`
        
        small64 = req.query.small_image || small_image
        small64 = await imageToBase64(small64)
        small64 = `data:image/png;base64,${small64}`
        
        let temp;
        if (activity.name === 'Spotify') {
            
            let start = activity.timestamps.start
            let end = activity.timestamps.end
            let elapsed = end - start
            let minutes = Math.floor(elapsed / 60000)
            let seconds = Math.floor((elapsed % 60000) / 1000)
            let timeString = `${minutes}:${seconds}` 

            temp = fs.readFileSync('./assets/cards/large/spotify-new.svg', {encoding: 'utf-8'}).toString()
            temp = temp.replace('[username]', username);
            temp = temp.replace('[pfp]', pfp64);
            temp = temp.replace('[banner]', banner64);
            temp = temp.replace('[about]', about);
            
            temp = temp.replace('[details]', details);
            temp = temp.replace('[state]', state);
            temp = temp.replace('[type]', type || 'Vibing');
            temp = temp.replace('[on]', largeText);
            temp = temp.replace('[time]', 'Time -  ' + timeString);
            
            temp = temp.replace('[large-image]', large64);
            temp = temp.replace('[small-image]', small64);

            temp = temp.replace('[spotify-logo]', spotify64);
            temp = temp.replace('[play-along]', play_along64);
            temp = temp.replace('[button-text]', "Play on Spotify");
        } else if (activity.name === 'Code' || activity.name === 'Visual Studio Code' ) {

            let time = activity.timestamps.start;
            let elapsed = Date.now() - time;
            let hours = Math.floor(elapsed / 3600000);
            let minutes = Math.floor((elapsed % 3600000) / 60000);
            let seconds = Math.floor((elapsed % 60000) / 1000);
            let timeString = `${hours}:${minutes}:${seconds}`;
            
            const largeimage = activity.assets.largeImage
            let largelink = largeimage.split('raw')[1]
            const rawlarge = 'https://raw' + largelink

            large64 = await imageToBase64(rawlarge)
            large64 = `data:image/png;base64,${large64}`

            const smallimage = activity.assets.smallImage
            let smallink = smallimage.split('raw')[1]
            const rawsmall = 'https://raw' + smallink

            small64 = await imageToBase64(rawsmall)
            small64 = `data:image/png;base64,${small64}`

            temp = fs.readFileSync('./assets/cards/large/vscode-new.svg', {encoding: 'utf-8'}).toString()
            temp = temp.replace('[username]', username);
            temp = temp.replace('[banner]', banner64);
            temp = temp.replace('[about]', about);
            temp = temp.replace('[pfp]', pfp64);

            temp = temp.replace('[name]', name || 'Coding');
            temp = temp.replace('[details]', details || 'No details');
            temp = temp.replace('[state]', state || 'No description');
            temp = temp.replace('[type]', type || 'Coding');
            temp = temp.replace('[time]', timeString + ' elapsed' || '0:00 elapsed');

            temp = temp.replace('[large-image]', large64);
            temp = temp.replace('[small-image]', small64);
            temp = temp.replace('[button-text]', activity.buttons[0] || 'Playing');
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

            temp = fs.readFileSync('./assets/cards/large/game-new.svg', {encoding: 'utf-8'}).toString()
            temp = temp.replace('[username]', username);
            temp = temp.replace('[banner]', banner64);
            temp = temp.replace('[about]', about);
            temp = temp.replace('[pfp]', pfp64);

            temp = temp.replace('[name]', name || 'Gaming');
            temp = temp.replace('[details]', details);
            temp = temp.replace('[state]', state);
            temp = temp.replace('[type]', type || 'Playing');
            temp = temp.replace('[time]', timeString + ' elapsed' || '0:00 elapsed');

            temp = temp.replace('[large-image]', raw);
        }
        
        res.setHeader("Surrogate-Control", "no-store");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        
        res.writeHead(200, {'Content-Type': 'image/svg+xml'})
        res.end(temp)
    })
}

api()
module.exports = router;
client.login(process.env.DISCORD_TOKEN);