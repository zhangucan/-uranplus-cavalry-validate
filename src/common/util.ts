import * as moment from "moment";
import * as bodybuilder from "bodybuilder";
import axios from "axios";

export function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k, v] of strMap) {
    obj[k] = v;
  }
  return obj;
}

export function deepMapToObj(strMap) {
  if (strMap instanceof Array) {
    let obj = [];
    for (let v of strMap) {
      obj.push(deepMapToObj(v));
    }
    return obj;
  } else if (strMap instanceof Set) {
    let obj = [];
    for (let v of strMap.values()) {
      obj.push(deepMapToObj(v));
    }
    return obj;
  } else if (strMap instanceof Map) {
    let obj = Object.create(null);
    for (let [k, v] of strMap) {
      obj[k] = deepMapToObj(v);
    }
    return obj;
  } else if (strMap instanceof Object) {
    let obj = Object.create(null);
    for (let k in strMap) {
      obj[k] = deepMapToObj(strMap[k]);
    }
    return obj;
  } else {
    return strMap;
  }
}

export function trimObj(obj) {
  const entry = {};
  Object.keys(obj).forEach(a => {
    entry[a] = obj[a].replace(/\s/g, "");
  });
  return entry;
}

export async function deleteOneMonthDataInEs(
  month: string,
  index: string,
  esUrl: string
) {
  let start = moment(month)
    .startOf("month")
    .format("YYYY-MM-DD");
  let query = bodybuilder()
    .filter("term", "month", start)
    .build();
  await axios({
    method: "POST",
    url: esUrl + "/" + index + "/_delete_by_query",
    headers: { "content-type": "application/json" },
    data: query
  });
}
