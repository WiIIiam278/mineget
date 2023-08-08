import { join } from "path";
import { fetchBuilder, MemoryCache } from "node-fetch-cache";
import lodash, { last } from "lodash";

type Endpoints = "downloads" | "rating" | "price" | "latest_version" | "name";
type AcceptedMarkets = {
    spigot: number,
    github: string,
    craftaro: number,
    polymart: number,
    modrinth: string,
    [key: string]: number | string
}

type EndpointResponse<T> = {
    status: 'success' | 'error',
    endpoints: T
}

type DownloadEndpointReponse = {
    [key: keyof AcceptedMarkets]: {
        downloads: number
    }
}

type RatingRatingResponse = {
    [key: keyof AcceptedMarkets]: {
        average: number,
        count: number
    }
}

type PriceEndpointResponse = {
    [key: keyof AcceptedMarkets]: {
        price: number,
        currency: string
    }
}

type LatestVersionEndpointResponse = {
    [key: keyof AcceptedMarkets]: {
        version: string,
        published: number
    }
}

type NameEndpointResponse = {
    [key: keyof AcceptedMarkets]: {
        name: string
    }
}

type ObjectType<T extends Endpoints> =
    T extends "downloads" ? EndpointResponse<DownloadEndpointReponse> & { total_downloads: number } :
    T extends "rating" ? EndpointResponse<RatingRatingResponse> & { average_rating: number, rating_count: number } :
    T extends "price" ? EndpointResponse<PriceEndpointResponse> & { lowest_price: number, lowest_price_currency: string } :
    T extends "latest_version" ? EndpointResponse<LatestVersionEndpointResponse> & { latest_version: string, latest_version_published: number } :
    T extends "name" ? EndpointResponse<NameEndpointResponse> :
    EndpointResponse<object>;

const fetch = fetchBuilder.withCache(new MemoryCache({
    ttl: 60 * 10 * 100
}));

/**
 * Queries the marketplace
 */
async function query<T extends Endpoints & string>(ids: Partial<AcceptedMarkets>, endpoint: T): Promise<ObjectType<T>> {
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
        if (typeof id !== ('number') && typeof id !== 'string') {
            throw new TypeError('Expected pair value to be of type number.');
        }

        const file = require(`../endpoints/${platform}`);

        if (!file) {
            lodash.set(response, `status`, `error`)
            lodash.set(response, `message`, `Unknown platform ${platform}`)
        }
        if (!file.endpoints) {
            lodash.set(response, `status`, 'error');
            lodash.set(response, `message`, `No endpoints for ${platform}`);
        }
        if (!file.endpoints[endpoint]) {
            lodash.set(response, `status`, 'error');
            lodash.set(response, `message`, `No endpoint ${endpoint} for ${platform}`);
        }

        const url = file.url;
        const path = file.endpoints[endpoint].endpoint;
        const fullUrl = (url + path).replace(/{id}/, id.toString());

        await fetch(fullUrl)
            .then((res) => {
                if (res.status !== 200) {
                    throw new Error(`Querying ${fullUrl} returned status: [${res.status}]: ${res.statusText}`)
                }
                return res.json();
            })
            .then((json) => {
                lodash.set(response, `endpoints.${platform}`, {});
                for (const [name, value] of Object.entries(file.endpoints[endpoint]['returns'])) {
                    lodash.set(response, `endpoints.${platform}.${name}`, lodash.get(json, value as string));
                }
            })
            .catch((err) => {
                return Promise.reject(err.message);
            })
    }
    return response as ObjectType<T>;
}

// export async function get(ids: Partial<AcceptedMarkets>) {
//     return await Promise.all([
//         downloads(ids),
//         rating(ids),
//         name(ids),
//         latest_version(ids),
//         price(ids)
//     ])
//         .then((res) => {
//             return {
//                 name: res[2].endpoints['name'],
//                 total_downloads: res[3]
//             }
//         })
// }

export async function price(ids: Partial<AcceptedMarkets>) {
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
            return res;
        })
        .catch((err) => {
            return Promise.reject(err);
        })
}

export async function downloads(ids: Partial<AcceptedMarkets>) {
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

export async function rating(ids: Partial<AcceptedMarkets>) {
    return query(ids, 'rating')
        .then((res) => {
            let totalRating = 0;
            let totalRatingCount = 0;
            for (const [name, data] of Object.entries(res.endpoints)) {
                if (typeof data.average !== 'number') data.average = -1;
                if (typeof data.count !== 'number') data.count = -1;
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

export async function latest_version(ids: Partial<AcceptedMarkets>) {
    return query(ids, 'latest_version')
        .then((res) => {
            let latestVersionName = '';
            let latestVersionDate = 0;
            for (const [name, data] of Object.entries(res.endpoints)) {
                let platformLatestVersionName = data.version;
                let platformLatestVersionDate = typeof data.published === 'string' ? lodash.parseInt(data.published) : data.published;
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

export async function name(ids: Partial<AcceptedMarkets>) {
    return query(ids, 'name')
        .then((res) => {
            return res;
        })
        .catch((err) => {
            return Promise.reject(err);
        })
}

export default {
    price,
    downloads,
    rating,
    latest_version,
    name
}