# mineget
![CI](https://img.shields.io/github/actions/workflow/status/WiIIiam278/mineget/run-tests.yml?branch=master&logo=github)
[![npm](https://img.shields.io/npm/v/mineget)](https://www.npmjs.com/package/mineget)
[![Discord](https://img.shields.io/discord/818135932103557162?color=7289da&logo=discord)](https://discord.gg/tVYhJfyDWG)

`mineget` is a node.js wrapper for a number of Minecraft marketplace APIs to easily fetch aggregated resource statistics, with typing support via Typescript .d.ts.

Queries are cached for 10 minutes to prevent excessive API calls.

## Usage
Example querying total downloads across multiple marketplaces.
```ts
import mineget from "mineget";

// Getting the total downloads of a resource
// Methods accept an object containing mappings of marketplace IDs
mineget.downloads({ spigot: 97144, polymart: 1634 })
.then((res) => {
  console.log(result)
})

```

```js
const mineget = require('mineget');

// Getting the total downloads of a resource
// Methods accept an object containing mappings of marketplace IDs
mineget.downloads({spigot: 97144, polymart: 1634})
.then((res) => {
    console.log(result);
});
```
This example will return a json object with following:
```json
{
  "status": "success",
  "endpoints": { 
    "spigot": { 
      "downloads": 466 
    }, 
    "polymart": { 
      "downloads": 19 
    }
  },
  "total_downloads": 485
}
```

## Methods
* `#downloads(ids)` - Get the total downloads of a resource across multiple marketplaces.
* `#rating(ids)` - Get the average rating and number of ratings of a resource across multiple marketplaces.
* `#price(ids)` - Get the lowest price and lowest price currency of a resource across multiple marketplaces. 
* `#latest_version(ids)` - Get the latest version name and published timestamp of a resource across multiple marketplaces.
* `#name(ids)` - Get the name of a resource as it is listed on different marketplaces.
* `#get(ids)` - Returns all available content from the above methods, and the aggregated data points available from each.

## Supported Marketplaces
You can query the following marketplaces with this module. Note that not all marketplaces support returning data for every query.

| id         | url                                          | `name` | `downloads` | `latest_version` | `rating` | `price` |
|------------|----------------------------------------------|--------|-------------|------------------|----------|---------|
| `spigot`   | [Spigot](https://www.spigotmc.org/) &dagger; | ✅      | ✅           | ✅                | ✅        | ✅       |
| `polymart` | [Polymart](https://polymart.com/)            | ✅      | ✅           | ✅                | ✅        | ✅       |
| `modrinth` | [Modrinth](https://www.modrinth.com/)        | ✅      | ✅           | ❌                | ❌        | ❌       |
| `hangar`   | [Hangar](https://hangar.papermc.io/)         | ✅      | ✅           | ❌                | ❌        | ❌       |
| `github`   | [Github](https://github.com/)                | ✅      | ✅           | ✅                | ❌        | ❌       |

Modrinth, GitHub and Hangar IDs are alphanumeric and accept a string.

If you'd like to add support for more marketplaces and additional marketplace API mappings, you can do so by submitting a pull request editing/adding a new marketplace json.

&dagger; *Queries are handled via [Spiget](https://spiget.org).*

## License
`mineget` is licensed under Apache-2.0.
