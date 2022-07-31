# mineget
[![npm](https://img.shields.io/npm/v/mineget)](https://www.npmjs.com/package/mineget)
[![Discord](https://img.shields.io/discord/818135932103557162?color=7289da&logo=discord)](https://discord.gg/tVYhJfyDWG)

`mineget` is a node.js wrapper for a number of Minecraft marketplace APIs to easily fetch aggregated resource statistics.

## Usage
Example querying total downloads across multiple marketplaces.
```js
const mineget = require('mineget');

// Getting the total downloads of a resource
// Methods accept an object containing mappings of marketplace IDs
mineget.downloads({'spigot': 97144, 'polymart': 1634, 'songoda': 758
}).then(result => {
    console.log(JSON.stringify(result));
});
```
This example will return a json object with following:
```json
{
  "status": "success",
  "endpoints": {
    "spigot": {
      "downloads": 180
    },
    "songoda": {
      "downloads": 2
    },
    "polymart": {
      "downloads": 8
    }
  },
  "total_downloads": 190
}
```

## Methods
* `#downloads(ids)` - Get the total downloads of a resource across multiple marketplaces.
* `#rating(ids)` - Get the average rating and number of ratings of a resource across multiple marketplaces.
* `#latest_version(ids)` - Get the latest version name and published timestamp of a resource across multiple marketplaces.
* `#name(ids)` - Get the name of a resource as it is listed on different marketplaces.

## Supported Marketplaces
You can query the following marketplaces with this module:

- `spigot` - [Spigot](https://www.spigotmc.org/) via [Spiget](https://spiget.org/)
- `polymart` - [Polymart](https://polymart.com/)
- `songoda` - [Songoda](https://songoda.com/)
- `modrinth` - [Modrinth](https://www.modrinth.com/) &dagger;

If you'd like to add support for more marketplaces and additional marketplace API mappings, you can do so by submitting a pull request editing the `marketplaces.json`.

&dagger; *Modrinth IDs are alphanumeric, as opposed to spigot/polymart/songoda which have integer IDs.*

## License
`mineget` is licensed under Apache-2.0.