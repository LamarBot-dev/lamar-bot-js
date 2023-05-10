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
const data = AutosaveJSON<SHAPE>(__dirname + "/db.json", DEFAULT);
export default data
type storedData = typeof data;
export type { storedData };