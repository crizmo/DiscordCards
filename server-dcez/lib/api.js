const express = require('express');
const router = express.Router();
const fs = require('fs');
const imageToBase64 = require('image-to-base64');
const { Client } = require('discord.js');
const client = new Client({ intents: 32767 });
require('dotenv').config();

const api = () => {
    router.get('/:id', async (req, res) => {
        let member;
        try {
            member = await client.guilds.cache.get("782646778347388959").members.fetch(req.params.id);
            if (member.user.bot) {
                return res.send("User is a bot");
            }
        } catch (e) {
            return res.send(`
                <html>
                <head><title>User not found</title></head>
                <body>
                <h3>User not found</h3>
                <p>User id: ${req.params.id}</p>
                <p>If the user is not in the DrunkBetch server, please add them to the server and try again</p>
                <a href="https://discord.gg/Ecy6WpEZsD">Join the DrunkBetch server</a>
                <p>If the user is in the server, please try reloading the page</p>
                </body>
                </html>
            `);
        }

        let discord_avatar, banner, about, activity, name, type, details, state, large_image, small_image, hex;
        let pfp64, banner64, large64, small64, smallbtn64;
        const username = member.user.username;

        try {
            discord_avatar = member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });
            banner = req.query.banner;
            about = (req.query.about || ' ').substring(0, 22);
            large_image = req.query.large_image || discord_avatar;
            small_image = req.query.small_image || "https://static-00.iconduck.com/assets.00/discord-icon-256x256-9roejvqx.png";
            hex = req.query.hex || '111214';
            smallbtn64 = "M10.076 11c.6 0 1.086.45 1.075 1 0 .55-.474 1-1.075 1C9.486 13 9 12.55 9 12s.475-1 1.076-1zm3.848 0c.601 0 1.076.45 1.076 1s-.475 1-1.076 1c-.59 0-1.075-.45-1.075-1s.474-1 1.075-1zm4.967-9C20.054 2 21 2.966 21 4.163V23l-2.211-1.995-1.245-1.176-1.317-1.25.546 1.943H5.109C3.946 20.522 3 19.556 3 18.359V4.163C3 2.966 3.946 2 5.109 2H18.89zm-3.97 13.713c2.273-.073 3.148-1.596 3.148-1.596 0-3.381-1.482-6.122-1.482-6.122-1.48-1.133-2.89-1.102-2.89-1.102l-.144.168c1.749.546 2.561 1.334 2.561 1.334a8.263 8.263 0 0 0-3.096-1.008 8.527 8.527 0 0 0-2.077.02c-.062 0-.114.011-.175.021-.36.032-1.235.168-2.335.662-.38.178-.607.305-.607.305s.854-.83 2.705-1.376l-.103-.126s-1.409-.031-2.89 1.103c0 0-1.481 2.74-1.481 6.121 0 0 .864 1.522 3.137 1.596 0 0 .38-.472.69-.871-1.307-.4-1.8-1.24-1.8-1.24s.102.074.287.179c.01.01.02.021.041.031.031.022.062.032.093.053.257.147.514.262.75.357.422.168.926.336 1.513.452a7.06 7.06 0 0 0 2.664.01 6.666 6.666 0 0 0 1.491-.451c.36-.137.761-.337 1.183-.62 0 0-.514.861-1.862 1.25.309.399.68.85.68.85z";

            pfp64 = `data:image/png;base64,${await imageToBase64(discord_avatar)}`;
            banner64 = banner ? `data:image/png;base64,${await imageToBase64(banner)}` : "";
            large64 = `data:image/png;base64,${await imageToBase64(large_image)}`;
            small64 = `data:image/png;base64,${await imageToBase64(small_image)}`;
        } catch (e) {
            console.log(e);
            // return res.send('Uh user error');
            return res.status(400).json({
                success: false,
                message: `Failed to process one or more images for user ID: ${req.params.id}. Please ensure that your image URLs are valid and publicly accessible.`,
                details: e.message
            });
        }

        try {
            activity = member.presence.activities.find(act => act.id !== 'custom' && act.type !== 'CUSTOM') || member.presence.activities[0];
        } catch (e) {
            return noActivity(res, pfp64, banner64, about, hex, smallbtn64, username);
        }

        if (!activity) {
            return noActivity(res, pfp64, banner64, about, hex, smallbtn64, username);
        }

        name = (activity.name || 'No name').replace(/&/g, '&amp;').substring(0, 23);
        details = (activity.details || req.query.details || 'No details').replace(/&/g, '&amp;').substring(0, 23);
        state = (activity.state || req.query.state || 'No state').replace(/&/g, '&amp;').substring(0, 25);
        type = (activity.type || req.query.type || 'No type').replace(/&/g, '&amp;').substring(0, 19);

        let temp = fs.readFileSync('./assets/updated/large.svg', { encoding: 'utf-8' }).toString();

        if (activity.name === 'Spotify') {
            return handleSpotifyActivity(res, temp, activity, pfp64, banner64, about, details, state, type, hex, large64, small64, smallbtn64, username);
        } else if (activity.name === 'Code' || activity.name === 'Visual Studio Code') {
            return handleCodeActivity(res, temp, activity, pfp64, banner64, about, details, state, type, hex, smallbtn64, username);
        } else if (activity.type === 'PLAYING') {
            return handlePlayingActivity(res, temp, activity, pfp64, banner64, about, details, state, type, hex, smallbtn64, username);
        }

        res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
        res.end(temp);
    });
};

const noActivity = (res, pfp64, banner64, about, hex, smallbtn64, username) => {
    let temp = fs.readFileSync('./assets/updated/large.svg', { encoding: 'utf-8' }).toString();
    temp = temp.replace('[username]', username)
        .replace('[banner]', banner64)
        .replace('[about]', about)
        .replace('[pfp]', pfp64)
        .replace('[name]', 'No Activity')
        .replace('[state]', 'on Discord')
        .replace('[on]', ' ')
        .replace('[type]', 'Discord Cards')
        .replace('[time]', '0:00 elapsed')
        .replace('[large-image]', pfp64)
        .replace('[small-image]', pfp64)
        .replace('[side-image]', pfp64)
        .replace('[small-btn]', smallbtn64)
        .replace('[hex]', hex)
        .replace('[button-text]', 'View Profile');

    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end(temp);
};

const handleSpotifyActivity = (res, temp, activity, pfp64, banner64, about, details, state, type, hex, large64, small64, smallbtn64, username) => {
    let elapsed = activity.timestamps.end - activity.timestamps.start;
    let timeString = `${Math.floor(elapsed / 60000)}:${Math.floor((elapsed % 60000) / 1000)}`;
    let largeText = (activity.assets?.largeText || req.query.large_text || 'No large text').replace(/&/g, '&amp;').substring(0, 23);
    let logo64 = fs.readFileSync('./assets/logos/spotify.txt', { encoding: 'utf-8' }).toString();

    temp = temp.replace('[username]', username)
        .replace('[banner]', banner64)
        .replace('[about]', about)
        .replace('[pfp]', pfp64)
        .replace('[name]', details)
        .replace('[state]', state)
        .replace('[type]', type || 'Vibing')
        .replace('[on]', largeText)
        .replace('[time]', 'Time -  ' + timeString)
        .replace('[large-image]', large64)
        .replace('[small-image]', small64)
        .replace('[side-image]', logo64)
        .replace('[small-btn]', smallbtn64)
        .replace('[hex]', hex)
        .replace('[button-text]', "Play on Spotify");

    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end(temp);
};

const handleCodeActivity = async (res, temp, activity, pfp64, banner64, about, details, state, type, hex, smallbtn64, username) => {
    let elapsed = Date.now() - activity.timestamps.start;
    let timeString = `${Math.floor(elapsed / 3600000)}:${Math.floor((elapsed % 3600000) / 60000)}:${Math.floor((elapsed % 60000) / 1000)}`;
    let large64, rawsmall;

    if (activity.assets != null) {
        let largeimage = activity.assets.largeImage;
        let largelink = largeimage.split('raw')[1];
        let rawlarge = 'https://raw' + largelink;
        large64 = await imageToBase64(rawlarge);
        large64 = `data:image/png;base64,${large64}`;
    } else {
        large64 = pfp64;
    }

    if (activity.assets != null) {
        let smallimage = activity.assets.smallImage;
        let smallink = smallimage.split('raw')[1];
        rawsmall = 'https://raw' + smallink;
    } else {
        rawsmall = 'https://cdn.discordapp.com/attachments/988140784807202886/1086221722807713812/vs_large.png';
    }

    let small64 = await imageToBase64(rawsmall);
    small64 = `data:image/png;base64,${small64}`;

    temp = temp.replace('[username]', username)
        .replace('[banner]', banner64)
        .replace('[about]', about)
        .replace('[pfp]', pfp64)
        .replace('[name]', activity.name || 'Coding')
        .replace('[on]', details || 'No details')
        .replace('[state]', state || 'No description')
        .replace('[type]', type || 'Coding')
        .replace('[time]', timeString + ' elapsed' || '0:00 elapsed')
        .replace('[large-image]', large64)
        .replace('[small-image]', small64)
        .replace('[side-image]', small64)
        .replace('[small-btn]', smallbtn64)
        .replace('[hex]', hex)
        .replace('[button-text]', activity.buttons[0] || 'Working on Code');

    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end(temp);
};

const handlePlayingActivity = async (res, temp, activity, pfp64, banner64, about, details, state, type, hex, smallbtn64, username) => {
    let elapsed = Date.now() - activity.timestamps.start;
    let timeString = `${Math.floor(elapsed / 3600000)}:${Math.floor((elapsed % 3600000) / 60000)}:${Math.floor((elapsed % 60000) / 1000)}`;
    let raw = await getImageBase64(activity.assets?.largeImage, pfp64);
    let small64 = await getImageBase64(activity.assets?.smallImage, pfp64);

    temp = temp.replace('[username]', username)
        .replace('[banner]', banner64)
        .replace('[about]', about)
        .replace('[pfp]', pfp64)
        .replace('[name]', activity.name || 'Gaming')
        .replace('[state]', details)
        .replace('[on]', state)
        .replace('[type]', type || 'Playing')
        .replace('[time]', timeString + ' elapsed' || '0:00 elapsed')
        .replace('[large-image]', raw)
        .replace('[small-image]', small64)
        .replace('[side-image]', small64)
        .replace('[small-btn]', smallbtn64)
        .replace('[hex]', hex)
        .replace('[button-text]', activity.buttons[0] || 'Playing Game');

    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end(temp);
};

const getImageBase64 = async (imageUrl, fallback) => {
    if (!imageUrl) return fallback;
    try {
        let imageBase64 = await imageToBase64(imageUrl);
        return `data:image/png;base64,${imageBase64}`;
    } catch (e) {
        return fallback;
    }
};

api();
module.exports = router;
client.login(process.env.DISCORD_TOKEN);