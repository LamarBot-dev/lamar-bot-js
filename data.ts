import { AutosaveJSON } from "./autosaver";
import { weedBusiness } from "./weed";


type SHAPE = {
    users: {
        [key: string]: {
            money: number;
            businesses: {
                weed: weedBusiness;
            };
            lifeinvader: {
                followers: string[];
            }
        };
    };
};

const DEFAULT = {
    users: {}
}

export const data = AutosaveJSON<SHAPE>(__dirname + "/data.json", DEFAULT);
type storedData = typeof data;
export type { storedData };