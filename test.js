'use strict'

const test = require('tape')
const proxyquire = require('proxyquire')
const path = require('path')
const fs = require('fs')
const ioRedisSpies = []

const Collector = proxyquire('.', {
  ioredis: function (...args) {
    return ioRedisSpies.shift()(...args)
  }
})

test('emits all metrics by default', function (t) {
  t.plan(5)

  ioRedisSpies.push((options) => {
    t.same(options, {
      host: 'localhost',
      port: 1234,
      password: 'xyz',
      maxRetriesPerRequest: 1
    })

    return {
      info (type, callback) {
        t.pass('info called')

        if (typeof type === 'function') {
          callback = type
          type = null
        }

        const file = type === null ? 'fixture_default_info.txt' : 'fixture_commandstats.txt'
        const fp = path.join(__dirname, file)

        fs.readFile(fp, 'utf8', callback)
      }
    }
  })

  const collector = Collector({
    connection: {
      host: 'localhost',
      port: 1234,
      password: 'xyz'
    }
  })

  const metrics = []

  collector.on('metric', metrics.push.bind(metrics))

  collector.ping((err) => {
    t.ifError(err, 'no ping error')
    t.same(metrics.map(simplify), [{
      name: 'telemetry.redis.used_memory.bytes',
      unit: 'bytes',
      resolution: 60,
      tags: {
        host: 'localhost:1234'
      },
      value: 32059408
    }, {
      name: 'telemetry.redis.used_memory_peak.bytes',
      unit: 'bytes',
      resolution: 60,
      tags: {
        host: 'localhost:1234'
      },
      value: 55703208
    }, {
      name: 'telemetry.redis.connected_clients.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234'
      },
      value: 4
    }, {
      name: 'telemetry.redis.blocked_clients.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234'
      },
      value: 2
    }, {
      name: 'telemetry.redis.rejected_connections.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234'
      },
      value: 0
    }, {
      name: 'telemetry.redis.instantaneous_ops_per_sec',
      unit: 'count/second',
      resolution: 60,
      tags: {
        host: 'localhost:1234'
      },
      value: 4
    }, {
      name: 'telemetry.redis.instantaneous_input_kbps',
      unit: 'kilobytes/second',
      resolution: 60,
      tags: {
        host: 'localhost:1234'
      },
      value: 0.28
    }, {
      name: 'telemetry.redis.instantaneous_output_kbps',
      unit: 'kilobytes/second',
      resolution: 60,
      tags: {
        host: 'localhost:1234'
      },
      value: 1.02
    }, {
      name: 'telemetry.redis.expired_keys.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234'
      },
      value: 89716
    }, {
      name: 'telemetry.redis.evicted_keys.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234'
      },
      value: 0
    }, {
      name: 'telemetry.redis.keyspace_hits.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234'
      },
      value: 11055214
    }, {
      name: 'telemetry.redis.keyspace_misses.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234'
      },
      value: 5250679
    }, {
      name: 'telemetry.redis.pubsub_channels.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234'
      },
      value: 2
    }, {
      name: 'telemetry.redis.database.keys.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        db: '0'
      },
      value: 155450
    }, {
      name: 'telemetry.redis.database.keys_with_expiry.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        db: '0'
      },
      value: 155450
    }, {
      name: 'telemetry.redis.command.calls.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'ttl'
      },
      value: 285
    }, {
      name: 'telemetry.redis.command.duration.us',
      unit: 'microseconds',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'ttl'
      },
      value: 4.34
    }, {
      name: 'telemetry.redis.command.calls.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'zremrangebyscore'
      },
      value: 529488
    }, {
      name: 'telemetry.redis.command.duration.us',
      unit: 'microseconds',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'zremrangebyscore'
      },
      value: 6.01
    }, {
      name: 'telemetry.redis.command.calls.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'ping'
      },
      value: 856881
    }, {
      name: 'telemetry.redis.command.duration.us',
      unit: 'microseconds',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'ping'
      },
      value: 1.45
    }, {
      name: 'telemetry.redis.command.calls.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'select'
      },
      value: 1
    }, {
      name: 'telemetry.redis.command.duration.us',
      unit: 'microseconds',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'select'
      },
      value: 1
    }, {
      name: 'telemetry.redis.command.calls.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'get'
      },
      value: 6432234
    }, {
      name: 'telemetry.redis.command.duration.us',
      unit: 'microseconds',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'get'
      },
      value: 3.91
    }, {
      name: 'telemetry.redis.command.calls.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'expire'
      },
      value: 2115444
    }, {
      name: 'telemetry.redis.command.duration.us',
      unit: 'microseconds',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'expire'
      },
      value: 5.8
    }, {
      name: 'telemetry.redis.command.calls.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'zcount'
      },
      value: 384472
    }, {
      name: 'telemetry.redis.command.duration.us',
      unit: 'microseconds',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'zcount'
      },
      value: 3.89
    }, {
      name: 'telemetry.redis.command.calls.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'zrangebyscore'
      },
      value: 529488
    }, {
      name: 'telemetry.redis.command.duration.us',
      unit: 'microseconds',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'zrangebyscore'
      },
      value: 11.21
    }, {
      name: 'telemetry.redis.command.calls.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'client'
      },
      value: 858364
    }, {
      name: 'telemetry.redis.command.duration.us',
      unit: 'microseconds',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'client'
      },
      value: 1.9
    }, {
      name: 'telemetry.redis.command.calls.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'multi'
      },
      value: 2762306
    }, {
      name: 'telemetry.redis.command.duration.us',
      unit: 'microseconds',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'multi'
      },
      value: 1.44
    }, {
      name: 'telemetry.redis.command.calls.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'exec'
      },
      value: 9440334
    }, {
      name: 'telemetry.redis.command.duration.us',
      unit: 'microseconds',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'exec'
      },
      value: 7.4
    }, {
      name: 'telemetry.redis.command.calls.count',
      unit: 'count',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'set'
      },
      value: 22082
    }, {
      name: 'telemetry.redis.command.duration.us',
      unit: 'microseconds',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        command: 'set'
      },
      value: 8.36
    }])
  })
})

test('can filter metrics with wildcard', function (t) {
  t.plan(2)

  ioRedisSpies.push((options) => {
    return {
      info (type, callback) {
        if (typeof type === 'function') {
          callback = type
          type = null
        }

        const file = type === null ? 'fixture_default_info.txt' : 'fixture_commandstats.txt'
        const fp = path.join(__dirname, file)

        fs.readFile(fp, 'utf8', callback)
      }
    }
  })

  const collector = Collector({
    connection: {
      host: 'localhost',
      port: 1234,
      password: 'xyz'
    },
    metrics: 'telemetry.redis.{used_memory,used_memory_peak}.*',
    tags: {
      foo: 'bar'
    }
  })

  const metrics = []

  collector.on('metric', metrics.push.bind(metrics))

  collector.ping((err) => {
    t.ifError(err, 'no ping error')
    t.same(metrics.map(simplify), [{
      name: 'telemetry.redis.used_memory.bytes',
      unit: 'bytes',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        foo: 'bar'
      },
      value: 32059408
    }, {
      name: 'telemetry.redis.used_memory_peak.bytes',
      unit: 'bytes',
      resolution: 60,
      tags: {
        host: 'localhost:1234',
        foo: 'bar'
      },
      value: 55703208
    }])
  })
})

function simplify (metric) {
  delete metric.date
  delete metric.statistic

  return metric
}
