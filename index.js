'use strict'

const Redis = require('ioredis')
const parseInfo = require('redis-info').parse
const single = require('@telemetry-js/metric').single
const match = require('@telemetry-js/match-metric-names')
const EventEmitter = require('events').EventEmitter

const ALL_METRICS = [
  'telemetry.redis.used_memory.bytes',
  'telemetry.redis.used_memory_peak.bytes',
  'telemetry.redis.connected_clients.count',
  'telemetry.redis.blocked_clients.count',
  'telemetry.redis.rejected_connections.count',
  'telemetry.redis.instantaneous_ops_per_sec',
  'telemetry.redis.instantaneous_input_kbps',
  'telemetry.redis.instantaneous_output_kbps',
  'telemetry.redis.expired_keys.count',
  'telemetry.redis.evicted_keys.count',
  'telemetry.redis.keyspace_hits.count',
  'telemetry.redis.keyspace_misses.count',
  'telemetry.redis.pubsub_channels.count',
  'telemetry.redis.database.keys.count',
  'telemetry.redis.database.keys_with_expiry.count',
  'telemetry.redis.command.calls.count',
  'telemetry.redis.command.duration.us'
]

class Collector extends EventEmitter {
  constructor (options) {
    super()

    if (!options || typeof options.connection !== 'object' || options.connection === null) {
      throw new TypeError('The "connection" option must be an object')
    }

    let { host, port, password } = options.connection

    if (typeof host !== 'string' || host === '') {
      throw new TypeError('The "host" property must be a non-empty string')
    }

    if (typeof port === 'string') {
      port = parseInt(port, 10)
    }

    if (typeof port !== 'number' || !Number.isInteger(port) || port <= 0) {
      throw new TypeError('The "port" property must be a positive number')
    }

    if (options.tags && typeof options.tags !== 'object') {
      throw new TypeError('The "tags" option must be an object')
    }

    // TODO (later): kill connection on collector#stop()
    this._redis = new Redis({
      host,
      port,
      password,
      maxRetriesPerRequest: 1
    })

    this._tags = options.tags || {}
    this._tags.host = `${host}:${port}`
    this._metrics = new Set(match(ALL_METRICS, options.metrics))
  }

  ping (callback) {
    this._redis.info((err, res) => {
      if (err) return callback(err)

      try {
        var info = parseInfo(res)
      } catch (err) {
        return callback(err)
      }

      this._emit('used_memory.bytes', 'bytes', info.used_memory)
      this._emit('used_memory_peak.bytes', 'bytes', info.used_memory_peak)
      this._emit('connected_clients.count', 'count', info.connected_clients)
      this._emit('blocked_clients.count', 'count', info.blocked_clients)

      // Number of connections rejected because of `maxclients` limit
      this._emit('rejected_connections.count', 'count', info.rejected_connections)

      // This is a running average of ~16 samples
      this._emit('instantaneous_ops_per_sec', 'count/second', info.instantaneous_ops_per_sec)
      this._emit('instantaneous_input_kbps', 'kilobytes/second', info.instantaneous_input_kbps)
      this._emit('instantaneous_output_kbps', 'kilobytes/second', info.instantaneous_output_kbps)

      this._emit('expired_keys.count', 'count', info.expired_keys)
      this._emit('evicted_keys.count', 'count', info.evicted_keys)
      this._emit('keyspace_hits.count', 'count', info.keyspace_hits)
      this._emit('keyspace_misses.count', 'count', info.keyspace_misses)
      this._emit('pubsub_channels.count', 'count', info.pubsub_channels)

      for (const dbIndex in info.databases) {
        const stats = info.databases[dbIndex]
        const tags = { db: dbIndex }

        this._emit('database.keys.count', 'count', stats.keys, tags)
        this._emit('database.keys_with_expiry.count', 'count', stats.expires, tags)
      }

      this._redis.info('commandstats', (err, res) => {
        if (err) return callback(err)

        try {
          var commands = parseInfo(res).commands
        } catch (err) {
          return callback(err)
        }

        for (const type in commands) {
          const cmd = commands[type]
          const tags = { command: type }

          this._emit('command.calls.count', 'count', cmd.calls, tags)
          this._emit('command.duration.us', 'microseconds', cmd.usec_per_call, tags)
        }

        callback()
      })
    })
  }

  _emit (name, unit, rawValue, extraTags) {
    const fqn = `telemetry.redis.${name}`
    if (!this._metrics.has(fqn)) return

    const value = parseFloat(rawValue)
    if (Number.isNaN(value)) return

    const tags = Object.assign({}, this._tags, extraTags)
    this.emit('metric', single(fqn, { unit, value, tags }))
  }
}

module.exports = (opts) => new Collector(opts)
