const express = require('express');
const router = express.Router();
const fs = require('fs');
const imageToBase64 = require('image-to-base64');
const { Client } = require('discord.js');
const client = new Client({ intents: 32767 });
require('dotenv').config();

const api_xomp = () => {
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
        let pfp64, banner64, large64, small64;

        try {
            discord_avatar = member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });
            banner = req.query.banner;
            about = (req.query.about || ' ').substring(0, 22);
            large_image = req.query.large_image || discord_avatar;
            small_image = req.query.small_image || "https://images.icon-icons.com/2108/PNG/512/discord_icon_130958.png";
            hex = req.query.hex || '4E545B';

            pfp64 = `data:image/png;base64,${await imageToBase64(discord_avatar)}`;
            banner64 = banner ? `data:image/png;base64,${await imageToBase64(banner)}` : " ";
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
            return noActivity(res, pfp64, banner64, about, hex);
        }

        if (!activity) {
            return noActivity(res, pfp64, banner64, about, hex);
        }

        name = (activity.name || 'No name').replace(/&/g, '&amp;').substring(0, 17);
        details = (activity.details || req.query.details || 'No details').replace(/&/g, '&amp;').substring(0, 25);
        state = (activity.state || req.query.state || 'No state').replace(/&/g, '&amp;').substring(0, 22);
        type = (activity.type || req.query.type || 'No type').replace(/&/g, '&amp;').substring(0, 19);

        let temp = fs.readFileSync('./assets/updated/small.svg', { encoding: 'utf-8' }).toString();

        if (activity.name === 'Spotify') {
            return handleSpotifyActivity(res, temp, activity, pfp64, banner64, about, details, state, type, hex, large64, small64);
        } else if (activity.name === 'Code' || activity.name === 'Visual Studio Code') {
            return handleCodeActivity(res, temp, activity, pfp64, banner64, about, details, state, type, hex);
        } else if (activity.type === 'PLAYING') {
            return handlePlayingActivity(res, temp, activity, pfp64, banner64, about, details, state, type, hex);
        } else if (activity.type === 'CUSTOM') {
            return noActivity(res, pfp64, banner64, about, hex);
        }

        res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
        res.end(temp);
    });
};

const noActivity = (res, pfp64, banner64, about, hex) => {
    let temp = fs.readFileSync('./assets/updated/small.svg', { encoding: 'utf-8' }).toString();
    temp = temp.replace('[pfp]', pfp64)
        .replace('[banner]', banner64)
        .replace('[about]', about)
        .replace('[type]', 'Discord Cards')
        .replace('[details]', 'No Activity')
        .replace('[state]', 'on Discord')
        .replace('[on]', ' ')
        .replace('[time]', ' ')
        .replace('[large-image]', pfp64)
        .replace('[small-image]', pfp64)
        .replace('[logo]', pfp64)
        .replace('[button-text]', "Chilling")
        .replace('[hex]', hex);

    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end(temp);
};

const handleSpotifyActivity = (res, temp, activity, pfp64, banner64, about, details, state, type, hex, large64, small64) => {
    let elapsed = activity.timestamps.end - activity.timestamps.start;
    let timeString = `${Math.floor(elapsed / 60000)}:${Math.floor((elapsed % 60000) / 1000)}`;
    let largeText = (activity.assets?.largeText || req.query.large_text || 'No large text').replace(/&/g, '&amp;').substring(0, 17);
    let logo64 = fs.readFileSync('./assets/logos/spotify.txt', { encoding: 'utf-8' }).toString();

    temp = temp.replace('[banner]', banner64)
        .replace('[about]', about)
        .replace('[details]', details)
        .replace('[state]', state)
        .replace('[type]', type || 'Vibing')
        .replace('[on]', largeText)
        .replace('[time]', 'Time -  ' + timeString)
        .replace('[large-image]', large64)
        .replace('[small-image]', small64)
        .replace('[logo]', logo64)
        .replace('[button-text]', "Play on Spotify")
        .replace('[hex]', hex);

    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end(temp);
};

const handleCodeActivity = async (res, temp, activity, pfp64, banner64, about, details, state, type, hex) => {
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

    temp = temp.replace('[banner]', banner64)
        .replace('[about]', about)
        .replace('[type]', type || 'Coding')
        .replace('[name]', activity.name || 'Coding')
        .replace('[details]', activity.name || 'Code')
        .replace('[state]', details || 'No description')
        .replace('[on]', state || 'No description')
        .replace('[time]', timeString + ' elapsed' || '0:00 elapsed')
        .replace('[large-image]', large64)
        .replace('[small-image]', small64)
        .replace('[logo]', small64)
        .replace('[button-text]', activity.buttons[0] || 'Working on Code')
        .replace('[hex]', hex);

    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end(temp);
};

const handlePlayingActivity = async (res, temp, activity, pfp64, banner64, about, details, state, type, hex) => {
    let elapsed = Date.now() - activity.timestamps.start;
    let timeString = `${Math.floor(elapsed / 3600000)}:${Math.floor((elapsed % 3600000) / 60000)}:${Math.floor((elapsed % 60000) / 1000)}`;
    let raw = await getImageBase64(activity.assets?.largeImage, pfp64);
    let small64 = await getImageBase64(activity.assets?.smallImage, pfp64);

    temp = temp.replace('[banner]', banner64)
        .replace('[pfp]', pfp64)
        .replace('[about]', about)
        .replace('[type]', type || 'Playing')
        .replace('[name]', activity.name || 'Gaming')
        .replace('[details]', details)
        .replace('[state]', state)
        .replace('[on]', ' ' || 'No description')
        .replace('[time]', timeString + ' elapsed' || '0:00 elapsed')
        .replace('[button-text]', activity.buttons[0] || 'Playing')
        .replace('[large-image]', raw)
        .replace('[small-image]', small64)
        .replace('[hex]', hex);

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

api_xomp();
module.exports = router;
client.login(process.env.DISCORD_TOKEN);