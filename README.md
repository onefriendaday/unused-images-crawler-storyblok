# Script to get unused images and assets in Storyblok

This is a small script you can use to get unused images and other assets from your content items and put them in a folder.

## How to use

1. Create a folder where you want to put the unused images into. Hover over the folder symbol and note down the folder id.

2. Get your Oauth token from the My account section of Storyblok

3. Exchange YOUR_OAUTH_TOKEN, YOUR_SPACE_ID and YOUR_FOLDER_ID in `index.js` with your values

4. Execute the script

~~~bash
$ npm install
$ node index.js
~~~
