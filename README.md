# collector-redis

> **Collect Redis metrics.**  
> A [`telemetry`](https://github.com/telemetry-js/telemetry) plugin.

[![npm status](http://img.shields.io/npm/v/telemetry-js/collector-redis.svg)](https://www.npmjs.org/package/@telemetry-js/collector-redis)
[![node](https://img.shields.io/node/v/@telemetry-js/collector-redis.svg)](https://www.npmjs.org/package/@telemetry-js/collector-redis)
[![Test](https://github.com/telemetry-js/collector-redis/workflows/Test/badge.svg?branch=main)](https://github.com/telemetry-js/collector-redis/actions)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Table of Contents

<details><summary>Click to expand</summary>

- [Usage](#usage)
- [Options](#options)
- [Install](#install)
- [Acknowledgements](#acknowledgements)
- [License](#license)

</details>

## Usage

```js
const telemetry = require('@telemetry-js/telemetry')()
const redis = require('@telemetry-js/collector-redis')

telemetry.task()
  .collect(redis, {
    connection: {
      host: 'example.com',
      port: 6379,
      password: 'abc'
    },
    tags: {
      name: 'myapp-production'
    }
  })
```

To collect metrics from multiple Redis hosts, repeat the `.collect` call. By default, all metrics will be tagged with `host` to differentiate hosts. It is recommended that you add more meaningful tags (like `name`) through the `tags` option.

## Options

- `connection`: required, object in the form of `{ host, port, password }`
- `tags`: optional, object. Note that some metrics (`database.*`, `command.*`) have their own tags (`db` and `command`, respectively), taking precedence over your tags.
- `metrics`: optional array of metric names to include. Supports wildcards, e.g. `{ metrics: ['telemetry.redis.command.*']'`. By default, all metrics are included.

## Install

With [npm](https://npmjs.org) do:

```
npm install @telemetry-js/collector-redis
```

## Acknowledgements

This project is kindly sponsored by [Reason Cybersecurity Inc](https://reasonsecurity.com).

[![reason logo](https://cdn.reasonsecurity.com/github-assets/reason_signature_logo.png)](https://reasonsecurity.com)

## License

[MIT](LICENSE) © Vincent Weevers
