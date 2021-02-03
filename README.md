# sails-hook-winston-sentry

Winston transports with Sentry for sails

## Requirement

- Sails ^1.3.x basement
- Sails hook `sails-util-micro-apps` installed(should be optional)

## Installation

- Install plugin

```shell
// because your are using sails micro-app, so you have to install this first.
npm install sails-util-micro-apps sails-hook-winston-sentry
```

## Configuration

`sails-hook-winston-sentry` has a simple config file that outputted for you.

so you can decided to enable this plugin or not, or change the default entry `/doc` to load the swagger documentation you want.

- config/log.js

```javascript
module.exports.log = {
  winston: {
    defaultMeta: null,
  },

  sentry: {
    dsn: null,
  },
};
```

- or use local.js

```javascript
module.exports.log = {
    log:{
        winston: {
            defaultMeta: null,
            ...
        },

        sentry: {
            dsn: null,
            ...
        },
    }
};
```
