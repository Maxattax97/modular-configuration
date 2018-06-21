Modular Configuration
=====================

A minimalistic configuration manager made _The Node Way_™.

# Goals

Other configuration modules failed to provide a few preferred features. This module aims to provide:

- environment variable, command line, overrides
- load from any directory, from a list of directories (with fallbacks)
- accept raw JSON objects
- have strict mode(s)
- have dot notation getters(/setters) ([dot notation module](https://www.npmjs.com/package/dot-prop))
- setters not necessary but helpful (per instance)
- read standard JSON, but also .JS (for dynamic fields?)
- synchronous and asynchronous support, with promises
- be hotloadable
- allow configuration overlaying
- be modular and function independently of other configuration objects
- allow configuration nesting and access via chaining
- allow configurations to be set, deleted, and saved
- allow configuration locking/immutability so that changes are prevented
- source tracking for debugging purposes
- option to use package.json
- browser support

# API

Contents of `./config.json`:
```json
{
    "Name": "John",
    "Values": [ 1, 2, 3, 9, 7, 8 ],
    "Object": {
        "Name": "Jake",
        "Values": [ 100, 200, 300 ]
    },
    "Boolean": true,
    "Float": 0.01,
    "Redirect": {
        "Home": {
            "Address": "https://example.com/",
            "Visitors": 87
        }
    }
}
```

Contents of `./alternate.json`:
```json
{
    "Name": "Elizabeth"
}
```

Example usage:
```javascript
const Config = require("modular-configuration");
let config = new Config();
let path = require("path");

config.setStrict(true);

config.load(Path.join(__dirname, "/config.json"))
    .then(function() {
        console.log(config.get("Name")); // -> John
        console.log(config.get("Values")); // -> [ 1, 2, 3, 9, 7, 8 ]
        console.log(config.get("Redirect.Home.Address")); // -> https://example.com/
        console.log(config.set("Name", "Nick"));
        console.log(config.get("Name")); // -> Nick

        let alternate = new Config();

        // Alternative loading method
        alternate.load("./alternate.json")
            .then(function() {
                console.log(config.get("Name")); // -> Elizabeth
            })
            .catch(function(err) {
                console.error(err);
            });

        let subConfig = new Config();
        subConfig.loadSync(config.get("Object"));
        console.log(subConfig.get("Name")); // -> Jake
        console.log(subConfig.get("Values")); // -> [ 100, 200, 300 ]
    })
    .then(function() {
        console.log(config.get("Unknown")); // Should crash
    })
    .catch(function(err) {
        console.error(err);
    });
```
