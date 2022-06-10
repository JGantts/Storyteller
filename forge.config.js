const fs = require("fs").promises;
const path = require("path");

async function copyDir(src, dest, ignore) {
  await fs.mkdir(dest, { recursive: true });
  let entries = await fs.readdir(src, { withFileTypes: true });

  for (let entry of entries) {
    if (path.extname(entry.name) != ignore) {
      let srcPath = './' + path.join(src, entry.name);
      let destPath = './' + path.join(dest, entry.name);


      entry.isDirectory() ?
        await copyDir(srcPath, destPath, ignore) :
        await fs.copyFile(srcPath, destPath);
    }
  }
}

module.exports = {
  packagerConfig: {
    "icon": "storyteller"
  },
  makers: [
    {
      "name": "@electron-forge/maker-squirrel",
      "config": {
        "name": "StoryTeller"
      }
    },
    {
      "name": "@electron-forge/maker-zip",
      "platforms": [
        "darwin"
      ]
    },
    {
      "name": "@electron-forge/maker-deb",
      "config": {}
    },
    {
      "name": "@electron-forge/maker-rpm",
      "config": {}
    }
  ],
  hooks: {
    generateAssets: async (forgeConfig) => {
      console.log("__ generateAssets __");
      let src = 'src';
      let hardDependencies = 'hard-dependencies';
      let dist = 'dist';

      let entries = await fs.readdir(dist, { withFileTypes: true });

      //await fs.rm(dist, { recursive: true, force: true });
      await copyDir(src, dist, '.ts');
      await copyDir(hardDependencies, path.join(dist, hardDependencies), null);
    },
    postStart: async (forgeConfig) => {
      console.log("__ postStart __");
    },
    prePackage: async (forgeConfig) => {
      console.log("__ prePackage __");
    },
    postPackage: async (forgeConfig) => {
      console.log("__ postPackage __");
    },
    preMake: async (forgeConfig) => {
      console.log("__ preMake __");
    },
    postMake: async (forgeConfig) => {
      console.log("__ postMake __");
    }
  },
  buildIdentifier: 'my-build'
}
