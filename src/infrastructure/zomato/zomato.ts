declare module "zomato" {
    export function createClient(config: Config): Client

    interface Config {
        userKey: string
    }

    interface Query {
        lon: number,
        lat: number,
    }
    export interface Client {
        getCuisines(query: Query, cb: Function): void
    }
}
