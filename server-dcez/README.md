# INFO
This is the backend of the breeze
made using express and react for fetching discord activity.

: Contains :
- socket routing to send and receive activity data from | to the client
- base api endpoints for the svg img of the user which contaings the data

: API Endpoints :
- /api : display the download svg of the user
- /api/:id : display the svg activity of the user with the id

: API Queries :

 [ Base ]
- banner :- banner="banner url" : change the banner of the user
- about :- about="about text" : change the about of the user
- type :- type="type text" : change the presence type of the user

 [ for Spotify / Games / Vs-code ]
- large_image :- large_image="large image url" : change the large image of the user
- small_image :- small_image="small image url" : change the small image of the user
- side_image :- side_image="side image url" : change the side image of the user

# Cards
Currently breeze supports vs code and spotify activity svg images.

: location :
- VsCode : assets/vscode-new.svg
  [Code card](https://media.discordapp.net/attachments/970974282681307187/988846773856518187/code.png)
- Spotify : assets/spotify-new.svg
  [Spotify card](https://media.discordapp.net/attachments/970974282681307187/988846774083002448/spotify.png)
- Playing : assets/game-new.svg
- No Activity : assets/no-activity-new.svg
- Downloaded tempcard : assets/tempcard.svg

# Ports 
- 3000 : backend server
- 3001 : client server + api

main folder - breeze