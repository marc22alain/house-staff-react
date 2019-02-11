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
        columns: null,
        values: null
      }
      if (data.results[0].series) {
        stuff.columns = data.results[0].series[0].columns;
        stuff.values = data.results[0].series[0].values;
      } 
      return stuff;
    });
}

function fetchLatestInSeries(options) {
  if (!options) {
    throw new TypeError('options must be defined');
  }

  let query = `${_formQuery(options)} ORDER BY time DESC LIMIT 1`;


  return fetch(`${stdQuery}${query}`)
    // TODO: screen for 4xx response
    .then((response) => response.json())
    .then((data) => {
      let stuff = {
        columns: null,
        values: null
      }
      if (data.results[0].series) {
        stuff.columns = data.results[0].series[0].columns;
        stuff.values = data.results[0].series[0].values;
      } 
      console.log('fetchLatestInSeries', stuff);
      return stuff;
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
  // The preferred method for passing in data:
  } else if (options.queryOptions) {
    measurement = options.queryOptions.measurement;

    tags = options.queryOptions.tags.map((tag) => {
      return `${tag.key}='${escape(tag.value)}'`;
    }).join(' AND ');

    if (options.queryOptions.fields.length > 0) {
      fields = options.queryOptions.fields.join();
    } else {
      fields = '*';
    }
  } else {
    measurement = options.measurement;
    fields = options.fields.join();

    tags = options.tags.map((tag) => {
      let key = Object.keys(tag)[0];
      return `${key}='${escape(tag[key])}'`;
    }).join(' AND ');
  }
  console.log('_formQuery', `SELECT ${fields} FROM ${measurement} WHERE ${tags}`)
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
      return convertToSeries(measurement, stuff);
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
        series: data.results[0].series[0].values,
        keys: data.results[1].series[0].values
      } 
      return convertToSeries(measurement, stuff);
    });
}

/* param: array of names */
function fetchAllSeriesAndKeys(measurements) {
  // http://192.168.2.31:8086/query?db=mydb&q=SHOW SERIES %3B SHOW MEASUREMENTS %3B SHOW FIELD KEYS FROM environment
  let queries = measurements.map((measurement) => `SHOW SERIES FROM ${measurement} %3B SHOW FIELD KEYS FROM ${measurement}`);
  let query = queries.join(' %3B ');
  return fetch(`${stdQuery}${query}`)
    .then((response) => response.json())
    .then((data) => {
      // Queries are made in pairs.
      let accum = {}, max = data.results.length;
      for (let i = 0; i < max; i++) {
        let measName = measurements[ Math.floor(i/2) ];
        let queryResult = data.results[i].series[0].values
        if (i%2 === 0) {
          // Add a new measurement sub-object.
          accum[ measName ] = {};
          accum[ measName ].series = [];

          accum[ measurements[ i/2 ]].series = queryResult.map((tagString) => {
            let tagBits = tagString[0].split(',').slice(1);
            let tags = tagBits.map((tag) => {
              let parts = tag.split('=');
              return {
                key: parts[0],
                value: parts[1]
              };
            });
            return { 
              tags: tags,
              seriesString: tagString[0]
            };
          });
        } else {
          accum[ measName ].keys = queryResult.map((field) => {
            return {
              name: field[0],
              type: field[1]
            };
          });
        }
      }
      return accum;
    });
}

function convertToSeries(measurement, data) {
  // let data = {
  //   measurement: measurement
  // }
  // let parts = 
  return data;
}

function fetchDBcatalog() {
  return fetchMeasurements()
    .then((measurements) => fetchAllSeriesAndKeys(measurements));
}

export { fetchMeasurements, fetchSeries, fetchTimeseries, fetchSeriesAndKeys, fetchAllSeriesAndKeys, fetchDBcatalog, fetchLatestInSeries };
