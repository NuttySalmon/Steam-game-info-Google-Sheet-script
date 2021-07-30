# Steam game info Google Sheet script
Google App script to query game info to populate Google Sheet columns.
Gets data from http://steampowered.com/ by either game name or Steam ID. Uses both webpage search and API provided by Steam.

## To use
1. In a Google Sheet, go to "Tools > Script editor".
2. Create create new `.gs` file and copy content in `steam.gs` to new `.gs` file.
3. To get data, use either `=steam()` or `=steamID()` as custom fomula, and columns on the same row will be populated with game info.

with `=steam()`, name of game should be provided. an additional `index` argument can be provided to indicate which result to get if the first result does not match the game you are querying about (e.g. index=2 for the second game from the result).

with `=steamID()`, Steam ID of game should be provided.

The custom formula will populate row with:

released status (released, early access, coming) , release date, initial price, genre, VR flag, splitscrean flag, controller flag, LAN flag, official name in database (useful for verifying unique entry in your spreadsheet), and link to Steam store for game queried.