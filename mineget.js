const {fetchBuilder, MemoryCache} = require('node-fetch-cache');
const lodash = require('lodash');
const marketplaces = require('./marketplaces.json');
const {parseInt} = require("lodash");

// Set up fetching, caching responses for 10 minutes
const fetch = fetchBuilder.withCache(new MemoryCache({
    ttl: 60 * 10 * 100
}));

/**
 * Query the marketplaces with the specified endpoints using the given ids.
 * @param ids A map of marketplace name to id. (e.g. {'spigot': '...', 'songoda': '...'})
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
            let fullUrl = (url + path).replace('{id}', id);

            await fetch(fullUrl).then(result => {
                if (result.status !== 200) {
                    throw new Error(`Querying ${fullUrl} returned ${result.status}`);
                }
                return result.json();
            }).then(json => {
                lodash.set(response, `endpoints.${platform}`, {});
                Object.entries(marketplaces.platforms[platform].endpoints[endpoint].returns).forEach(entry => {
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
 * Query the marketplaces for their download counts and aggregate them together
 * @param ids A map of marketplace name to id. (e.g. {'spigot': '...', 'songoda': '...'})
 * @returns {Promise<*>} The result of the query returning a json object, containing the download counts for each marketplace endpoint and the 'total_downloads' count.
 */
exports.downloads = function (ids) {
    let endpointName = 'downloads';
    return query(ids, endpointName).then(result => {
        let totalDownloads = 0;
        Object.entries(result['endpoints']).forEach(entry => {
            let platformDownloads = parseInt(entry[1]['downloads']);
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
 * @param ids A map of marketplace name to id. (e.g. {'spigot': '...', 'songoda': '...'})
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
            totalRating += platformRatingAverage;
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
 * @param ids A map of marketplace name to id. (e.g. {'spigot': '...', 'songoda': '...'})
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
            lodash.set(result, `endpoints.${entry[0]}.published`, parseInt(platformLatestVersionDate));
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
 * @param ids A map of marketplace name to id. (e.g. {'spigot': '...', 'songoda': '...'})
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