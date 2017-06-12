var FlumeReduce = require('flumeview-reduce')
var ref = require('ssb-ref')

exports.name = 'contacts'
exports.version = require('./package.json').version
exports.manifest = {
  stream: 'source',
  get: 'async'
}

exports.init = function (ssb, config) {
  return ssb._flumeUse('contacts', FlumeReduce(1, reduce, map))
}

function reduce (result, item) {
  if (!result) result = {}
  if (item) {
    for (var source in item) {
      var valuesForSource = result[source] = result[source] || {}
      for (var key in item[source]) {
        var valuesForKey = valuesForSource[key] = valuesForSource[key] || {}
        for (var dest in item[source][key]) {
          var value = item[source][key][dest]
          if (!valuesForKey[dest] || value[1] > valuesForKey[dest][1]) {
            valuesForKey[dest] = value
          }
        }
      }
    }
  }
  return result
}

function map (msg) {
  if (msg.value.content && msg.value.content.type === 'contact' && ref.isLink(msg.value.content.contact)) {
    var source = msg.value.author
    var dest = msg.value.content.contact
    var values = {}

    if ('following' in msg.value.content) {
      values[source] = {
        following: {
          [dest]: [msg.value.content.following, msg.value.timestamp]
        }
      }
      values[dest] = {
        followers: {
          [source]: [msg.value.content.following, msg.value.timestamp]
        }
      }
    }

    return values
  }
}
