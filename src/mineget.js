const {fetchBuilder, MemoryCache} = require('node-fetch-cache');
const lodash = require('lodash');
const marketplaces = require('../src/marketplaces.json');
const {parseInt} = require("lodash");

// Set up fetching, caching responses for 10 minutes
const fetch = fetchBuilder.withCache(new MemoryCache({
    ttl: 60 * 10 * 100
}));

/**
 * Query the marketplaces with the specified endpoints using the given ids.
 * @param ids A map of marketplace name to id. (e.g. {'spigot': '...', 'craftaro': '...'})
 * @param endpoint The endpoint to query. (e.g. 'downloads')
 * @returns {Promise<unknown>} The result of the query
 */
const query = (ids, endpoint) => {
    return new Promise(async function (res) {
        let response = {
            'status': 'success',
            'endpoints': {}
        };
        for (const entry of Object.entries(ids)) {
            if (!entry) {
                continue;
            }
            let platform = entry[0];
            let id = entry[1];
            if (!platform || !id) {
                continue;
            }
            if (!marketplaces.platforms[platform]) {
                lodash.set(response, `status`, 'error');
                lodash.set(response, `message`, `Unknown platform ${platform}`);
                res(response);
                return;
            }
            if (!marketplaces.platforms[platform].endpoints) {
                lodash.set(response, `status`, 'error');
                lodash.set(response, `message`, `No endpoints for ${platform}`);
                res(response);
                return;
            }
            if (!marketplaces.platforms[platform].endpoints[endpoint]) {
                lodash.set(response, `status`, 'error');
                lodash.set(response, `message`, `No endpoint ${endpoint} for ${platform}`);
                res(response);
                return;
            }

            let url = marketplaces.platforms[platform].url;
            let path = marketplaces.platforms[platform].endpoints[endpoint].endpoint;
            let fullUrl = (url + path).replace('{id}', id.toString());

            await fetch(fullUrl).then(result => {
                if (result.status !== 200) {
                    throw new Error(`Querying ${fullUrl} returned ${result.status}`);
                }
                return result.json();
            }).then(json => {
                lodash.set(response, `endpoints.${platform}`, {});
                Object.entries(marketplaces.platforms[platform].endpoints[endpoint]['returns']).forEach(entry => {
                    lodash.set(response, `endpoints.${platform}.${entry[0]}`, lodash.get(json, entry[1]));
                });
            }).catch(fetchError => {
                lodash.set(response, `status`, 'error');
                lodash.set(response, `message`, `Error fetching: ${fetchError}`);
            });
        }
        res(response);
    });
}

/**
 * Query the marketplaces for various statistics about the resource
 * @param ids A map of marketplace name to id. (e.g. {'spigot': '...', 'craftaro': '...'})
 * @returns {Promise<{last_updated: int, latest_version: string, name: string, average_rating: float, total_downloads: int, rating_count: int, lowest_price: float, lowest_price_currency: string}>}
 */
exports.get = async function(ids) {
    return await Promise.all([
        exports.downloads(ids),
        exports.rating(ids),
        exports.name(ids),
        exports.latest_version(ids),
        exports.price(ids)
    ]).then(results => {
        return {
            name: results[2]['name'],
            total_downloads: results[0]['total_downloads'],
            average_rating: results[1]['average_rating'],
            rating_count: results[1]['rating_count'],
            latest_version: results[3]['latest_version'],
            last_updated: results[3]['latest_version_published'],
            lowest_price: results[4]['lowest_price'],
            lowest_price_currency: results[4]['lowest_price_currency']
        };
    });
}

/**
 * Query the marketplaces for the various prices and currency of the resource
 * @param ids A map of marketplace name to id. (e.g. {'spigot': '...', 'craftaro': '...'})
 * @returns {Promise<*>} The result of the query returning a json object, containing the prices and currency on each platform, as well as a "lowest price" with its currency
 */
exports.price = function (ids) {
    let endpointName = 'price';
    return query(ids, endpointName).then(result => {
        let lowestPrice = 0;
        let lowestPriceCurrency = 'USD';
        Object.entries(result['endpoints']).forEach(entry => {
            let platformPrice = parseFloat(entry[1]['price'] || '0.00');
            let platformCurrency = (entry[1]['currency'] || 'USD').toUpperCase();
            lodash.set(result, `endpoints.${entry[0]}.price`, platformPrice);
            lodash.set(result, `endpoints.${entry[0]}.currency`, platformCurrency);
            if (platformPrice < lowestPrice || lowestPrice === 0) {
                lowestPrice = platformPrice;
                lowestPriceCurrency = platformCurrency;
            }
        });
        lodash.set(result, 'lowest_price', lowestPrice);
        lodash.set(result, 'lowest_price_currency', lowestPriceCurrency.toUpperCase());
        return result;
    }, error => {
        return error;
    });
}

/**
 * Query the marketplaces for their download counts and aggregate them together
 * @param ids A map of marketplace name to id. (e.g. {'spigot': '...', 'craftaro': '...'})
 * @returns {Promise<*>} The result of the query returning a json object, containing the download counts for each marketplace endpoint and the 'total_downloads' count.
 */
exports.downloads = function (ids) {
    let endpointName = 'downloads';
    return query(ids, endpointName).then(result => {
        let totalDownloads = 0;
        Object.entries(result['endpoints']).forEach(entry => {
            let platformDownloads = parseInt(entry[1]['downloads'] || '0');
            lodash.set(result, `endpoints.${entry[0]}.downloads`, platformDownloads);
            totalDownloads += platformDownloads;
        });
        lodash.set(result, 'total_downloads', totalDownloads);
        return result;
    }, error => {
        return error;
    });
}

/**
 * Query the marketplaces for their star ratings and aggregate them together
 * @param ids A map of marketplace name to id. (e.g. {'spigot': '...', 'craftaro': '...'})
 * @returns {Promise<*>} The result of the query returning a json object, containing the star ratings for each marketplace endpoint and an aggregated 'average_rating' and 'rating_count'.
 */
exports.rating = function (ids) {
    let endpointName = 'rating';
    return query(ids, endpointName).then(result => {
        let totalRating = 0;
        let totalRatingCount = 0;
        Object.entries(result['endpoints']).forEach(entry => {
            let platformRatingAverage = parseFloat(entry[1]['average']);
            let platformRatingCount = parseInt(entry[1]['count']);
            lodash.set(result, `endpoints.${entry[0]}.average`, platformRatingAverage);
            lodash.set(result, `endpoints.${entry[0]}.count`, platformRatingCount);
            totalRating += (platformRatingAverage * platformRatingCount);
            totalRatingCount += platformRatingCount;
        });
        lodash.set(result, 'average_rating', totalRating / totalRatingCount);
        lodash.set(result, 'rating_count', totalRatingCount);
        return result;
    }, error => {
        return error;
    });
}

/**
 * Query the marketplaces for the latest version of the resource on each one
 * @param ids A map of marketplace name to id. (e.g. {'spigot': '...', 'craftaro': '...'})
 * @returns {Promise<*>} The result of the query returning a json object, containing the latest resource version for each marketplace endpoint and the most recently published version as the canonical 'latest_version', alongside 'latest_version_published' indicating when it was published.
 */
exports.latest_version = function (ids) {
    let endpointName = 'latest_version';
    return query(ids, endpointName).then(result => {
        let latestVersionName = '';
        let latestVersionDate = 0;
        Object.entries(result['endpoints']).forEach(entry => {
            let platformLatestVersionName = entry[1]['version'];
            let platformLatestVersionDate = parseInt(entry[1]['published']);
            lodash.set(result, `endpoints.${entry[0]}.version`, platformLatestVersionName);
            lodash.set(result, `endpoints.${entry[0]}.published`, parseInt(platformLatestVersionDate || '0'));
            if (platformLatestVersionDate > latestVersionDate) {
                latestVersionName = platformLatestVersionName;
                latestVersionDate = platformLatestVersionDate;
            }
        });
        if (latestVersionName !== '') {
            lodash.set(result, 'latest_version', latestVersionName);
            lodash.set(result, 'latest_version_published', parseInt(latestVersionDate));
        }
        return result;
    }, error => {
        return error;
    });
}

/**
 * Query the marketplaces for the name of the resource
 * @param ids A map of marketplace name to id. (e.g. {'spigot': '...', 'craftaro': '...'})
 * @returns {Promise<*>} The result of the query returning a json object, containing the name of the resource for each marketplace endpoint.
 */
exports.name = function (ids) {
    let endpointName = 'name';
    return query(ids, endpointName).then(result => {
        return result;
    }, error => {
        return error;
    });
}