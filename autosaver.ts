import * as fs from "fs"

function AutosaveJSON<T>(
    path: string,
    defaultvalue: T
): {
    current: T;
    save: () => void;
    close: () => void;
} {
    let filevalue = defaultvalue;
    if (fs.existsSync(path)) {
        filevalue = JSON.parse(String(fs.readFileSync(path)));
    }
    const saverunner = () => {
        const stringedcurrent = JSON.stringify(data.current);
        if (oldcurrent !== stringedcurrent) {
            fs.writeFileSync(path, stringedcurrent);
            oldcurrent = stringedcurrent;
        }
    };
    const data = {
        current: filevalue,
        save: saverunner,
        close: () => {
            saverunner();
            clearInterval(interval);
        },
    };
    let oldcurrent = JSON.stringify(filevalue);
    const interval = setInterval(saverunner, 200);
    return data;
}

export { AutosaveJSON };
