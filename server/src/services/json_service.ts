import * as fs from 'fs';

async function getJsonData(filename: string): Promise<Object> {
  var data = await new Promise<string>((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if(err) {
        console.error(err);
        reject('Can`t read file');
      } else {
        resolve(data);
      }
    });
  });

  try {
    return JSON.parse(data);
  } catch(e) {
    console.error(e);
    throw new Error('Wrong file format');
  }
}

function writeJsonData(filename: string, data: Object) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, JSON.stringify(data), 'utf8', (err) => {
      if(err) {
        console.error(err);
        reject('Cat`t write file');
      } else {
        resolve();
      }
    });
  })
}

function getJsonDataSync(filename: string) {
  let data = fs.readFileSync(filename, 'utf8');
  try {
    return JSON.parse(data);
  } catch(e) {
    console.error(e);
    throw new Error('Wrong file format');
  }
}

function writeJsonDataSync(filename: string, data: Object) {
  fs.writeFileSync(filename, JSON.stringify(data));
}

export {
  getJsonData,
  writeJsonData,
  getJsonDataSync,
  writeJsonDataSync
}
