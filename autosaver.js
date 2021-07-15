const fs = require("fs")

function AutosaveJSON(path, defaultvalue) {
  let filevalue = defaultvalue
  if (fs.existsSync(path)) {
    filevalue = JSON.parse(fs.readFileSync(path))
  }
  const saverunner = () => {
    const stringedcurrent = JSON.stringify(data.current)
    if (oldcurrent !== stringedcurrent) { fs.writeFileSync(path, stringedcurrent); oldcurrent = stringedcurrent }
  }
  const data = { current: filevalue, save: saverunner, close: () => { saverunner(); clearInterval(interval) } }
  let oldcurrent = JSON.stringify(filevalue)
  const interval = setInterval(saverunner, 200);
  return data;
}

module.exports = { AutosaveJSON };
