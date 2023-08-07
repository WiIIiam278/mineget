import { join } from "path";
import { fetchBuilder, MemoryCache } from "node-fetch-cache";
import lodash, { last } from "lodash";

type Endpoints = "downloads" | "rating" | "price" | "latest_version" | "name";
type AcceptedMarkets = {
    spigot: number,
    github: number,
    craftaro: number,
    polymart: number,
    modrinth: number,
    [key: string]: number
}

type EndpointResponse<T> = {
    status: 'success' | 'error',
    endpoints: T
}

type DownloadEndpointReponse = {
    [key: keyof AcceptedMarkets]: {

    }
}

type RatingRatingResponse = {
    [key: keyof AcceptedMarkets]: {

    }
}

type PriceEndpointResponse = {
    [key: keyof AcceptedMarkets]: {
        price: number,
        currency: number
    }
}

type LatestVersionEndpointResponse = {
    [key: keyof AcceptedMarkets]: {

    }
}

type NameEndpointResponse = {
    [key: keyof AcceptedMarkets]: {

    }
}

type ObjectType<T extends Endpoints> =
    T extends "downloads" ? EndpointResponse<DownloadEndpointReponse> :
    T extends "rating" ? EndpointResponse<RatingRatingResponse> :
    T extends "price" ? EndpointResponse<PriceEndpointResponse> :
    T extends "latest_version" ? EndpointResponse<LatestVersionEndpointResponse> :
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
        if (typeof id !== ('number')) {
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
                    lodash.set(response, `endpoints.${platform}.${name}`, Number(lodash.get(json, value as string)));
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

//     ])
// }

export async function price(ids: Partial<AcceptedMarkets>) {
    const endpointName = 'price';
    return query(ids, endpointName)
        .then((res) => {
            console.log(res)
            let lowestPrice = 0;
            let lowestCurrency = 'USD';
            for (const [name, data] of Object.entries(res.endpoints)) {
                console.log(data)
                let platformPrice = parseFloat(data.price.toString())
            }
        })
}

price({ spigot: 92672 })
    .then((res) => {
        console.log(res)
    })