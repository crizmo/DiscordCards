# INFO
This is the backend of the DCEZ client.
made using express for fetching discord activity.

: Contains :
- socket routing to send and receive data from | to the client
- base onlysvg endpoints for the svg img api of the user

: API Endpoints :
- /svg : display the download svg of the user
- /svg/:id : display the svg activity of the user with the id

# Cards
Currently breeze supports vs code and spotify activity svg images.

: location :
- VsCode : assets/vscode-card.svg
- Spotify : assets/spotify-card.svg
- Downloaded tempcard : assets/tempcard.svg

# Ports 
- 3000 : backend server
- 3001 : client server
- 5000 : svg user card api

main folder - breeze