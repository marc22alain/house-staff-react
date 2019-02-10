const influxHost = 'http://192.168.2.31:8086/';
const db = 'mydb';
// Uses GET
const stdQuery = `${influxHost}query?db=${db}&q=`;

/* 'SHOW MEASUREMENTS':
  {
    "results": [
      {
        "statement_id": 0,
        "series": [
          {
            "name": "measurements",
            "columns": [
              "name"
            ],
            "values": [
              [
                "environment"
              ],
              [
                "mymeas"
              ]
            ]
          }
        ]
      }
    ]
  }
*/
function fetchMeasurements() {
  let query = escape('SHOW MEASUREMENTS');
  return fetch(`${stdQuery}${query}`)
    .then((response) => response.json())
    .then((data) => {
      return reduce2Darray(data.results[0].series[0].values);
    });
}

function reduce2Darray(arr) {
  return arr.reduce((a, b) => a.concat(b),[])
}

/*  'SELECT':
  {
    "results": [
      {
        "statement_id": 0,
        "series": [
          {
            "name": "environment",
            "columns": [
              "time",
              "humidity"
            ],
            "values": [
              [
                "2019-02-01T04:08:41.125Z", 21.8, null, "plant", "orchid", "HIH-6130#001", 17.4
              ],
              [
                "2019-02-01T04:25:17.466Z", 27.73, null, "plant", "orchid", "HIH-6130#001", 17.38
              ]
            ]
          }
        ]
      }
    ]
  }

*/

/*  'options':  
  {
    measurement: <string>,
    tags: [{<string>:<string>}],
    fields: [<string>]
  }
*/
function fetchTimeseries(options) {
  if (!options) {
    throw new TypeError('options must be defined');
  }

  let query = _formQuery(options)


  return fetch(`${stdQuery}${query}`)
    // TODO: screen for 4xx response
    .then((response) => response.json())
    .then((data) => {
      let stuff = {
        columns: data.results[0].series[0].columns,
        values: data.results[0].series[0].values
      } 
      console.log('data from fetchTimeseries', stuff);
      return convertToSeries(stuff);
    });
}

function _formQuery(options) {
  let measurement, tags, fields
  if (options.seriesQuery) {
    let parts = options.seriesQuery.split(',');
    measurement = parts.shift();
    fields = '*';

    tags = parts.map((tag) => {
      let parts = tag.split('=');
      return `${parts[0]}='${escape(parts[1])}'`;
    }).join(' AND ');
  } else {
    measurement = options.measurement;
    fields = options.fields.join();

    tags = options.tags.map((tag) => {
      let key = Object.keys(tag)[0];
      return `${key}='${escape(tag[key])}'`;
    }).join(' AND ');
  }

  return `SELECT ${fields} FROM ${measurement} WHERE ${tags}`;
}

// here's the query that would suit the name 'SHOW SERIES FROM environment'
// the result represents the actual experiments that can be reported on
// ... is independent of the data fields that are included in the series
function fetchSeries(measurement='environment') {
  let query = `SHOW SERIES FROM ${measurement}`;
  return fetch(`${stdQuery}${query}`)
    .then((response) => response.json())
    .then((data) => {
      let stuff = {
        // columns: data.results[0].series[0].columns,
        values: data.results[0].series[0].values
      } 
      console.log('data from fetchSeries', stuff);
      return convertToSeries(stuff);
    });
}

function fetchSeriesAndKeys(measurement='environment') {
  // http://192.168.2.31:8086/query?db=mydb&q=SHOW SERIES %3B SHOW MEASUREMENTS %3B SHOW FIELD KEYS FROM environment
  let query = `SHOW SERIES FROM ${measurement} %3B SHOW FIELD KEYS FROM ${measurement}`;
  return fetch(`${stdQuery}${query}`)
    .then((response) => response.json())
    .then((data) => {
      let stuff = {
        // columns: data.results[0].series[0].columns,
        values: data.results[0].series[0].values,
        keys: data.results[1].series[0].values
      } 
      console.log('data from fetchSeries', stuff);
      return convertToSeries(stuff);
    });
}

function convertToSeries(data) {
  return data;
}

export { fetchMeasurements, fetchSeries, fetchTimeseries, fetchSeriesAndKeys };
