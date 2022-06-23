const express = require('express');
const router = express.Router();

const fs = require('fs');

const { Client, Intents, Collection } = require('discord.js');
const Discord = require('discord.js');
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

        let member
        try {
            member = await client.guilds.cache.get("782646778347388959").members.fetch(req.params.id);
        } catch (e) {
            res.send('User not found ! Please try again')
            // console.log(e)
            return;
        }
        
        let activity, discord_avatar, spotify_logo, username, banner, about, play_along

        try {
            discord_avatar = member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })
            spotify_logo = 'https://www.freeiconspng.com/uploads/spotify-icon-0.png'
            username = member.user.username + '#' + member.user.discriminator
            banner = req.query.banner || 'https://cdn.discordapp.com/attachments/970974282681307187/987323350709862420/green-back.png'
            about = req.query.about || ' '
            if (about.length > 20) {
                about = about.substring(0, 20) + "..."
            }

            play_along = "https://cdn.discordapp.com/attachments/970974282681307187/987330240609132555/play-along.png"
        } catch (e) {
            res.send('Uh user error')
            console.log(e)
            return;
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
                let type, details
                try {
                    type = req.query.type || 'Chilling'
                    details = req.query.details || 'Vibiing'

                    if (type.length > 20) {
                        type = type.substring(0, 20) + "..."
                    }
                    if (details.length > 20) {
                        details = details.substring(0, 20) + "..."
                    }
                } catch (e) {
                    type = 'Chilling'
                    details = 'Vibing'
                }

                temp = fs.readFileSync('./assets/cards/no-activity-new.svg', {encoding: 'utf-8'}).toString()
                temp = temp.replace('[pfp]', discord_avatar);
                temp = temp.replace('[username]', username);
                temp = temp.replace('[banner]', banner);
                temp = temp.replace('[about]', about);

                temp = temp.replace('[type]', type);
                temp = temp.replace('[details]', details);

                temp = temp.replace('[large-image]', req.query.large_image || discord_avatar)
                temp = temp.replace('[small-image]', req.query.small_image || discord_avatar)
                temp = temp.replace('[side-image]', req.query.side_image || discord_avatar)

                console.log(`${member.user.username} has no activity`)
                // res.send('User has no activity')
                res.writeHead(200, {'Content-Type': 'image/svg+xml'})
                res.end(temp)
            }
            no_activity()
            return;
        }

        let name, details, state, smallimg, raw, largeText
            
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
            details = activity.details.replace(/&/g, '&amp;');
            if (details.length > 23) {
                details = details.substring(0, 23) + '...';
            }
        }
        
        if(!activity.state){
            state = 'No description'
        } else {
            state = activity.state.replace(/&/g, '&amp;');
            if (state.length > 23) {
                state = state.substring(0, 23) + '...';
            }
        }
        
        if(!activity.assets){
            raw = req.query.large_image || discord_avatar
        } else if(activity.assets.smallImage === null) {
            raw = req.query.large_image || discord_avatar
        } else if(activity.assets.smallImage.startsWith('mp:external')){
            smallimg = activity.assets.smallImage
            let smalllink = smallimg.split('https/')[1]
            raw = 'https://' + smalllink
        } else {
            raw = req.query.large_image || discord_avatar   
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
        
        let temp;
        if (activity.name === 'Spotify') {

            let start = activity.timestamps.start
            let end = activity.timestamps.end
            let elapsed = end - start
            let minutes = Math.floor(elapsed / 60000)
            let seconds = Math.floor((elapsed % 60000) / 1000)
            let timeString = `${minutes}:${seconds}` 

            temp = fs.readFileSync('./assets/cards/spotify-new.svg', {encoding: 'utf-8'}).toString()
            temp = temp.replace('[username]', username);
            temp = temp.replace('[banner]', banner);
            temp = temp.replace('[about]', about);

            temp = temp.replace('[play-along]', play_along);

            temp = temp.replace('[details]', details);
            temp = temp.replace('[state]', state);
            temp = temp.replace('[type]', req.query.type || activity.type);
            temp = temp.replace('[on]', largeText);
            temp = temp.replace('[time]', 0 + ' -- ' + timeString);
            temp = temp.replace('[pfp]', discord_avatar);
            temp = temp.replace('[large-image]', req.query.large_image || discord_avatar);
            temp = temp.replace('[small-image]', req.query.small_image || spotify_logo);
            temp = temp.replace('[spotify-logo]', spotify_logo);
            temp = temp.replace('[button-text]', "Play on Spotify");
        } else if (activity.name === 'Code') {

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

            temp = temp.replace('[name]', activity.name || 'Gaming');
            temp = temp.replace('[details]', activity.details || 'No details');
            temp = temp.replace('[state]', state || 'No description');
            temp = temp.replace('[type]', req.query.type || activity.type);
            temp = temp.replace('[time]', timeString + ' elapsed' || '0:00 elapsed');
            temp = temp.replace('[large-image]', rawlarge);
            temp = temp.replace('[small-image]', rawsmall);
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

            temp = fs.readFileSync('./assets/cards/game-new.svg', {encoding: 'utf-8'}).toString()
            temp = temp.replace('[username]', username);
            temp = temp.replace('[banner]', banner);
            temp = temp.replace('[about]', about);
            temp = temp.replace('[pfp]', discord_avatar);

            temp = temp.replace('[name]', name || 'Gaming');
            temp = temp.replace('[details]', details || 'No details');
            temp = temp.replace('[state]', state || 'No description');
            temp = temp.replace('[type]', req.query.type || activity.type);
            temp = temp.replace('[large-image]', raw);
            temp = temp.replace('[time]', timeString + ' elapsed' || '0:00 elapsed');
        }
        res.writeHead(200, {'Content-Type': 'image/svg+xml'})
        res.end(temp)
    })
}

api()
module.exports = router;
client.login(process.env.DISCORD_TOKEN);