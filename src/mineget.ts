import { fetchBuilder, MemoryCache } from "node-fetch-cache";
import lodash from "lodash";

type Endpoints = "downloads" | "rating" | "price" | "latest_version" | "name";
type PackagedMarkets = {
    spigot: number,
    github: string,
    polymart: number,
    modrinth: string,
    hangar: string
}

type EndpointResponse<T> = {
    status: 'success' | 'error',
    endpoints: Record<keyof PackagedMarkets, T>
}

type DownloadEndpointResponse = {
    downloads: number
}

type RatingEndpointResponse = {
    average: number,
    count: number
}

type PriceEndpointResponse = {
    price: number,
    currency: string
}

type LatestVersionEndpointResponse = {
    version: string,
    published: number
}

type NameEndpointResponse = {
    name: string
}

type ObjectType<T extends Endpoints> =
    T extends "downloads" ? EndpointResponse<DownloadEndpointResponse> & { total_downloads: number } :
    T extends "rating" ? EndpointResponse<RatingEndpointResponse> & { average_rating: number, rating_count: number } :
    T extends "price" ? EndpointResponse<PriceEndpointResponse> & { lowest_price: number, lowest_price_currency: string } :
    T extends "latest_version" ? EndpointResponse<LatestVersionEndpointResponse> & { latest_version: string, latest_version_published: number } :
    T extends "name" ? EndpointResponse<NameEndpointResponse> :
    EndpointResponse<object>;

const fetch = fetchBuilder.withCache(new MemoryCache({
    ttl: 60 * 10 * 100
}));

/**
 * Query the marketplaces with the specified endpoints using the given ids.
 * @param ids A map of marketplace name to id.
 * @param endpoint The endpoint to query.
 * @returns The result of the query
 */
async function query<T extends Endpoints & string>(ids: Partial<PackagedMarkets>, endpoint: T): Promise<ObjectType<T>> {
    let response = {
        status: 'success',
        endpoints: {}
    }
    for (const [platform, id] of Object.entries(ids)) {
        if (!platform || !id) {
            continue;
        }
        if (typeof platform !== 'string') {
            throw new TypeError('Expected key value to be of type string.');
        }
        if (typeof id !== 'number' && typeof id !== 'string') {
            throw new TypeError('Expected pair value to be of type number or string.');
        }

        const file = require(`../endpoints/${platform}`);

        if (!file) {
            return Promise.reject(new ReferenceError(`Unknown platform ${platform}`));
        }
        if (!file?.endpoints) {
            return Promise.reject(new ReferenceError(`No endpoints for ${platform}`));
        }
        if ((!file?.endpoints[endpoint])) {
            continue;
        }

        const url = file.url;
        const path = file.endpoints[endpoint].endpoint;
        const fullUrl = (url + path).replace(/{id}/, id.toString());

        await fetch(fullUrl)
            .then((res) => {
                if (res.status !== 200) {
                    return Promise.reject(new Error(`Querying ${fullUrl} returned status: [${res.status}]: ${res.statusText}`));
                }
                return res.json();
            })
            .then((json) => {
                lodash.set(response, `endpoints.${platform}`, {});
                for (const [name, value] of Object.entries(file.endpoints[endpoint]['returns'])) {
                    lodash.set(response, `endpoints.${platform}.${name}`, getReturnValue(json, value as string));
                }
            })
            .catch((err) => {
                return Promise.reject(err);
            })
    }
    return response as ObjectType<T>;
}

/**
 * Resolve a path in a json object
 * @param json  The json object to resolve the path in
 * @param returnPath  The path to resolve
 * @returns  The resolved value at the path
 */
function getReturnValue(json: object, returnPath: string) {
    // If the type of json is an array, iterate through each item and get the value
    if (Array.isArray(json)) {
        let returnSum = 0;
        for (const item of json) {
            const value = getReturnValue(item, returnPath);
            if (typeof value === 'number') {
                returnSum += value;
            }
        }
        return returnSum;
    }

    // If the path includes [], then we need to iterate through each item in the array and get the value
    if (returnPath.includes('[]')) {
        const splitPath = returnPath.split('[]');
        const array = lodash.get(json, splitPath[0]);
        if (!array) {
            return undefined;
        }

        let returnSum = 0;
        for (const item of array) {
            const value = getReturnValue(item, splitPath[1]);
            if (typeof value === 'number') {
                returnSum += value;
            }
        }
        return returnSum;
    }

    // Otherwise, get the simple value at the path
    return lodash.get(json, returnPath);
}

/**
 * Query the marketplaces for various statistics about the resource
 * @param ids Key/value pairs of marketplace name to id.
 * @returns An object with exposed information
 */
export async function get(ids: Partial<PackagedMarkets>) {
    return await Promise.all([
        downloads(ids),
        rating(ids),
        name(ids),
        latest_version(ids),
        price(ids)
    ])
        .then((res) => {
            return {
                name: res[2].endpoints,
                downloads: res[0].endpoints,
                ratings: res[1].endpoints,
                version: res[3].endpoints,
                price: res[4].endpoints,
                total_downloads: res[0].total_downloads,
                average_rating: res[1].average_rating,
                rating_count: res[1].rating_count,
                latest_version: res[3].latest_version,
                last_updated: res[3].latest_version_published,
                lowest_price: res[4].lowest_price,
                lowest_price_currency: res[4].lowest_price_currency
            }
        })
        .catch((err) => {
            return Promise.reject(err)
        })
}

/**
 * Query the marketplaces for the various prices and currency of the resource
 * @param ids Key/value pairs of marketplace name to id.
 * @returns The result of the query returning a json object, containing the prices and currency on each platform, as well as a "lowest price" with its currency
 */
export async function price(ids: Partial<PackagedMarkets>) {
    const endpointName = 'price';
    return query(ids, endpointName)
        .then((res) => {
            let lowestPrice = 0;
            let lowestCurrency = 'USD';
            for (const [name, data] of Object.entries(res.endpoints)) {
                let platformPrice = parseFloat(data.price.toString() || '0.00');
                let platformCurrency = (data.currency || 'USD').toUpperCase();
                lodash.set(res, `endpoints.${name}.price`, Number(platformPrice));
                lodash.set(res, `endpoints.${name}.currency`, platformCurrency);
                if (platformPrice < lowestPrice || lowestPrice === 0) {
                    lowestPrice = platformPrice;
                    lowestCurrency = platformCurrency;
                }
            }
            lodash.set(res, 'lowest_price', lowestPrice);
            lodash.set(res, 'lowest_price_currency', lowestCurrency.toUpperCase());
            return Promise.resolve(res);
        })
        .catch((err) => {
            return Promise.reject(err);
        })
}

/**
 * Query the marketplaces for their download counts and aggregate them together
 * @param ids Key/value pairs of marketplace name to id.
 * @returns The result of the query returning a json object, containing the download counts for each marketplace endpoint and the 'total_downloads' count.
 */
export async function downloads(ids: Partial<PackagedMarkets>) {
    return query(ids, 'downloads')
        .then((res) => {
            let totalDownloads = 0;
            for (const [name, data] of Object.entries(res.endpoints)) {
                let platformDownloads = lodash.parseInt(data.downloads.toString() || '0');
                lodash.set(res, `endpoints.${name}.downloads`, platformDownloads);
                totalDownloads += platformDownloads;
            }
            lodash.set(res, 'total_downloads', totalDownloads);
            return res;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

/**
 * Query the marketplaces for their star ratings and aggregate them together
 * @param ids Key/value pairs of marketplace name to id.
 * @returns The result of the query returning a json object, containing the star ratings for each marketplace endpoint and an aggregated 'average_rating' and 'rating_count'.
 */
export async function rating(ids: Partial<PackagedMarkets>) {
    return query(ids, 'rating')
        .then((res) => {
            let totalRating = 0;
            let totalRatingCount = 0;
            for (const [name, data] of Object.entries(res.endpoints)) {
                if (typeof data.average !== 'number') data.average = 0;
                if (typeof data.count !== 'number') data.count = 0;
                let platformAverage = parseFloat(data.average.toString());
                let platformCount = lodash.parseInt(data.count.toString());
                lodash.set(res, `endpoints.${name}.average`, platformAverage);
                lodash.set(res, `endpoints.${name}.count`, platformCount);
                totalRating += (platformAverage * platformCount);
                totalRatingCount += platformCount;
            }
            lodash.set(res, 'average_rating', totalRating / totalRatingCount);
            lodash.set(res, 'rating_count', totalRatingCount);
            return res;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

/**
 * Query the marketplaces for the latest version of the resource on each one
 * @param ids Key/value pairs of marketplace name to id.
 * @returns The result of the query returning a json object, containing the latest resource version for each marketplace endpoint and the most recently published version as the canonical 'latest_version', alongside 'latest_version_published' indicating when it was published.
 */
export async function latest_version(ids: Partial<PackagedMarkets>) {
    return query(ids, 'latest_version')
        .then((res) => {
            let latestVersionName = '';
            let latestVersionDate = 0;
            for (const [name, data] of Object.entries(res.endpoints)) {
                let platformLatestVersionName = data.version;
                let platformLatestVersionDate: number;
                if (typeof data.published === 'string') {
                    if (isDateString(data.published)) platformLatestVersionDate = Date.parse(data.published);
                    else if (isUnixString(data.published)) platformLatestVersionDate = Number(data.published);
                    else throw new Error(`Unknown date time string format received from ${name}`);
                }
                else {
                    platformLatestVersionDate = data.published;
                }
                typeof data.published === 'string' ? Date.parse(data.published) : data.published
                lodash.set(res, `endpoints.${name}.version`, platformLatestVersionName);
                lodash.set(res, `endpoints.${name}.published`, (platformLatestVersionDate || '0'));
                if (platformLatestVersionDate > latestVersionDate) {
                    latestVersionName = platformLatestVersionName;
                    latestVersionDate = platformLatestVersionDate;
                }
            }
            if (latestVersionName !== '') {
                lodash.set(res, 'latest_version', latestVersionName);
                lodash.set(res, 'latest_version_published', latestVersionDate);
            }
            return res;
        })
        .catch((err) => {
            return Promise.reject(err);
        })
}

/**
 * Query the marketplaces for the name of the resource
 * @param ids Key/value pairs of marketplace name to id.
 * @returns The result of the query returning a json object, containing the name of the resource for each marketplace endpoint.
 */
export async function name(ids: Partial<PackagedMarkets>) {
    return query(ids, 'name')
        .then((res) => {
            return res;
        })
        .catch((err) => {
            return Promise.reject(err);
        })
}

const isDateString = (string: string) => {
    if (string.match(/^(?:(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?)?(?:T(\d{2}:\d{2})(?::(\d{2}))?(?:.(\d{3})|Z)?(?:(?:[+-])(\d{2}:\d{2}))?)?$/)) {
        return true;
    }
    else {
        return false;
    }
}

const isUnixString = (string: string) => {
    if (string.match(/^(\d{6,13})$/)) {
        return true;
    }
    else {
        return false;
    }
}

export default {
    get,
    price,
    downloads,
    rating,
    latest_version,
    name
}