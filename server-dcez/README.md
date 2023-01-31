<div align="center">
  <h3 align="center">Discord Cards</h3>

  <p align="center">
    An awesome way to display your discord activity !
    <br />
    <a href="https://github.com/crizmo/DiscordCards/blob/main/server-dcez/README.md"><strong>Explore more »</strong></a>
    <br />
    <a href="https://github.com/crizmo/DiscordCards/tree/main/server-dcez">Server Side</a>
    ·
    <a href="https://github.com/crizmo/dcez-client">Client Side</a>
    ·
    <a href="https://discord-cards.netlify.app/">Website</a>
  </p>
</div>

<details>
  <summary>Features</summary>
  <ol>
    <li>
      <a href="#discord-cards-api">Discord Cards API</a>
    </li>
    <li><a href="#api-endpoints">API endpoints</a></li>
    <li><a href="#api-qiery-parameters">API queries</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

## Discord Cards API

With the help of Discord Cards API you can display your discord activity as a card on your website or anywhere you want. 

Join the [discord server](https://discord.gg/VcMPV8vc2x) to start using the API cards.

![Discord Cards](https://media.discordapp.net/attachments/988140784807202886/993533565738426378/breeze.png?width=1028&height=474)

## API Endpoints

<a href="https://discord-cards.kurizu.repl.co/">Base</a> <br> 
<a href="https://discord-cards.kurizu.repl.co/api/card/:id">User card large</a> <br>
<a href="https://discord-cards.kurizu.repl.co/api/compact/:id">User card compact</a> <br>

These are the base endpoints of Discord Cards , :id is the main card endpoint.
When using the api img in readme do add a ? at the end of the url to keep clearing the cache.

<p align="right">(<a href="#top">back to top</a>)</p>

## API Query Parameters

  * banner: url of the banner image
  * hex: hex color for alternative banner color [ ?hex=D0D1D1 ]
  * about: about the user
  * type: discord activity type

  * large_image: url of the large image
  * small_image: url of the small image
  * side_image: url of the side image

  large_image, small_image , side_image are basically the activity images.

<p align="right">(<a href="#top">back to top</a>)</p>

## License

Distributed under the MIT License. See `LICENSE.md` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>