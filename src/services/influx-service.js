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

  let fields = options.fields.join();

  let tags = options.tags.map((tag) => {
    let key = Object.keys(tag)[0];
    return `${key}='${tag[key]}'`;
  }).join();

  let query = `SELECT ${fields} FROM ${options.measurement} WHERE ${tags}`;
  return fetch(`${stdQuery}${query}`)
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

function convertToSeries(data) {
  return data;
}

export { fetchMeasurements, fetchSeries, fetchTimeseries };
