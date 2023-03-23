const express = require('express');
const router = express.Router();

const fs = require('fs');
const imageToBase64 = require('image-to-base64');

const { Client } = require('discord.js');
const client = new Client({ intents: 32767 });
require('dotenv').config();

const api = () => {

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

        let username, discord_avatar, banner, about
        let activity, name, type, details, state
        let large_image, small_image
        let smallimg, largeimg, raw // for PLaying
        let largeText // for Spotify

        let hex
        let temp_small

        let pfp64, banner64
        // let spotify64
        let large64, small64let, smallbtn64

        try {
            discord_avatar = member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })
            username = member.user.username + '#' + member.user.discriminator
            banner = req.query.banner
            about = req.query.about || ' '
            if (about.length > 20) {
                about = about.substring(0, 20) + "..."
            }

            temp_small = "https://cdn.discordapp.com/attachments/988140784807202886/991310761991360512/small_breeze.png"
            large_image = req.query.large_image || discord_avatar
            small_image = req.query.small_image || temp_small

            hex = req.query.hex || '111214'
            smallbtn64 = "M10.076 11c.6 0 1.086.45 1.075 1 0 .55-.474 1-1.075 1C9.486 13 9 12.55 9 12s.475-1 1.076-1zm3.848 0c.601 0 1.076.45 1.076 1s-.475 1-1.076 1c-.59 0-1.075-.45-1.075-1s.474-1 1.075-1zm4.967-9C20.054 2 21 2.966 21 4.163V23l-2.211-1.995-1.245-1.176-1.317-1.25.546 1.943H5.109C3.946 20.522 3 19.556 3 18.359V4.163C3 2.966 3.946 2 5.109 2H18.89zm-3.97 13.713c2.273-.073 3.148-1.596 3.148-1.596 0-3.381-1.482-6.122-1.482-6.122-1.48-1.133-2.89-1.102-2.89-1.102l-.144.168c1.749.546 2.561 1.334 2.561 1.334a8.263 8.263 0 0 0-3.096-1.008 8.527 8.527 0 0 0-2.077.02c-.062 0-.114.011-.175.021-.36.032-1.235.168-2.335.662-.38.178-.607.305-.607.305s.854-.83 2.705-1.376l-.103-.126s-1.409-.031-2.89 1.103c0 0-1.481 2.74-1.481 6.121 0 0 .864 1.522 3.137 1.596 0 0 .38-.472.69-.871-1.307-.4-1.8-1.24-1.8-1.24s.102.074.287.179c.01.01.02.021.041.031.031.022.062.032.093.053.257.147.514.262.75.357.422.168.926.336 1.513.452a7.06 7.06 0 0 0 2.664.01 6.666 6.666 0 0 0 1.491-.451c.36-.137.761-.337 1.183-.62 0 0-.514.861-1.862 1.25.309.399.68.85.68.85z";
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
                banner64 = ""
            }

            if (req.query.large_image) {
                large64 = large_image
                large64 = await imageToBase64(large64)
                large64 = `data:image/png;base64,${large64}`
            } else {
                large64 = pfp64
            }

            if (req.query.small_image) {
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
            if (member.presence.activities[0].id === 'custom' && !member.presence.activities[1]) {
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
                    details = req.query.details || 'on discord'

                    if (type.length > 23) {
                        type = type.substring(0, 23) + "..."
                    }
                    if (details.length > 23) {
                        details = details.substring(0, 23) + "..."
                    }
                } catch (e) {
                    type = 'Discord Cards'
                    details = ' '
                }

                temp = fs.readFileSync('./assets/updated/large.svg', { encoding: 'utf-8' }).toString()

                temp = temp.replace('[username]', username);
                temp = temp.replace('[banner]', banner64);
                temp = temp.replace('[about]', about);
                temp = temp.replace('[pfp]', pfp64);
    
                temp = temp.replace('[name]', 'No Activity');
                temp = temp.replace('[state]', details);
                temp = temp.replace('[on]', ' ');
                temp = temp.replace('[type]', type);
                temp = temp.replace('[time]', '0:00 elapsed');
    
                temp = temp.replace('[large-image]', large64);
                temp = temp.replace('[small-image]', small64);
                temp = temp.replace('[side-image]', small64);
                temp = temp.replace('[small-btn]', smallbtn64);
                temp = temp.replace('[hex]', hex);

                temp = temp.replace('[button-text]', 'View Profile');

                res.writeHead(200, { 'Content-Type': 'image/svg+xml' })
                res.end(temp)
            }
            no_activity()
            return;
        }

        if (!activity.name) {
            name = 'No name'
        } else {
            name = activity.name.replace(/&/g, '&amp;');
            if (name.length > 23) {
                name = name.substring(0, 23) + '...';
            }
        }

        if (!activity.details) {
            details = req.query.details || 'No details'
            if (details.length > 23) {
                details = details.substring(0, 23) + '...';
            }
        } else {
            details = activity.details.replace(/&/g, '&amp;')
            if (details.length > 23) {
                details = details.substring(0, 23) + '...';
            }
        }

        if (!activity.state) {
            state = req.query.state || 'No state'
            if (state.length > 25) {
                state = state.substring(0, 25) + '...';
            }
        } else {
            state = activity.state.replace(/&/g, '&amp;')
            if (state.length > 25) {
                state = state.substring(0, 25) + '...';
            }
        }

        if (!activity.type) {
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
        temp = fs.readFileSync('./assets/updated/large.svg', { encoding: 'utf-8' }).toString()
        if (activity.name === 'Spotify') {
            let start = activity.timestamps.start
            let end = activity.timestamps.end
            let elapsed = end - start
            let minutes = Math.floor(elapsed / 60000)
            let seconds = Math.floor((elapsed % 60000) / 1000)
            let timeString = `${minutes}:${seconds}`

            if (!activity.assets) {
                largeText = req.query.large_text || 'No large text'
            } else if (activity.assets.largeText === null) {
                largeText = req.query.large_text || 'No large text'
            } else {
                largeText = activity.assets.largeText.replace(/&/g, '&amp;');
                if (largeText.length > 23) {
                    largeText = largeText.substring(0, 23) + '...';
                }
            }

            if (!activity.details) {
                details = req.query.details || 'No details'
                if (details.length > 15) {
                    details = details.substring(0, 15) + '...';
                }
            } else {
                details = activity.details.replace(/&/g, '&amp;')
                if (details.length > 15) {
                    details = details.substring(0, 15) + '...';
                }
            }

            let logo64 = fs.readFileSync('./assets/logos/spotify.txt', { encoding: 'utf-8' }).toString()

            temp = temp.replace('[pfp]', pfp64);
            temp = temp.replace('[username]', username);
            temp = temp.replace('[banner]', banner64);

            temp = temp.replace('[about]', about);
            temp = temp.replace('[name]', details);
            temp = temp.replace('[state]', state);
            temp = temp.replace('[type]', type || 'Vibing');
            temp = temp.replace('[on]', largeText);
            temp = temp.replace('[time]', 'Time -  ' + timeString);

            temp = temp.replace('[large-image]', large64);
            temp = temp.replace('[small-image]', small64);
            temp = temp.replace('[side-image]', logo64);
            temp = temp.replace('[small-btn]', smallbtn64);

            temp = temp.replace('[hex]', hex);

            temp = temp.replace('[button-text]', "Play on Spotify");
        } else if (activity.name === 'Code' || activity.name === 'Visual Studio Code') {
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

            temp = temp.replace('[username]', username);
            temp = temp.replace('[banner]', banner64);
            temp = temp.replace('[about]', about);
            temp = temp.replace('[pfp]', pfp64);

            temp = temp.replace('[name]', name || 'Coding');
            temp = temp.replace('[on]', details || 'No details');
            temp = temp.replace('[state]', state || 'No description');
            temp = temp.replace('[type]', type || 'Coding');
            temp = temp.replace('[time]', timeString + ' elapsed' || '0:00 elapsed');

            temp = temp.replace('[large-image]', large64);
            temp = temp.replace('[small-image]', small64);
            temp = temp.replace('[side-image]', small64);
            temp = temp.replace('[small-btn]', smallbtn64);

            temp = temp.replace('[hex]', hex);
            temp = temp.replace('[button-text]', activity.buttons[0] || 'Working on Code');
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
            
            temp = temp.replace('[username]', username);
            temp = temp.replace('[banner]', banner64);
            temp = temp.replace('[about]', about);
            temp = temp.replace('[pfp]', pfp64);

            temp = temp.replace('[name]', name || 'Gaming');
            temp = temp.replace('[state]', details);
            temp = temp.replace('[on]', state);
            temp = temp.replace('[type]', type || 'Playing');
            temp = temp.replace('[time]', timeString + ' elapsed' || '0:00 elapsed');

            temp = temp.replace('[large-image]', raw);
            temp = temp.replace('[small-image]', small64);
            temp = temp.replace('[side-image]', small64);
            temp = temp.replace('[small-btn]', smallbtn64);
            temp = temp.replace('[hex]', hex);

            temp = temp.replace('[button-text]', activity.buttons[0] || 'Playing Game');
        }

        res.writeHead(200, { 'Content-Type': 'image/svg+xml' })
        res.end(temp)
        // console.log(`Card generated in ${Date.now() - startTime}ms`);
    })
}

api()
module.exports = router;
client.login(process.env.DISCORD_TOKEN);