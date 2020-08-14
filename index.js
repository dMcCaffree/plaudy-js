const baseUrl = 'https://api.plaudy.com/v1';
let workspaceId = null;
let userId = null;
let objectId = null;

exports.init = async (apiKey = '') => {
  try {
    const response = await makeRequest('POST', `${baseUrl}/auth/init`, {apiKey});
    const responseObject = JSON.parse(response);
    console.log('RESPONSE:', responseObject);

    if (typeof responseObject === 'object' && responseObject.hasOwnProperty('id')) {
      workspaceId = responseObject.id;
    }

    return JSON.parse(response);
  } catch (error) {
    console.log('ERROR:', error);
    return error;
  }
};

exports.track = async (eventType, data = {}) => {
  if (!eventType || typeof eventType === 'object') {
    return `Expected string 'eventType' as first argument.`;
  }
  let request = {};

  request.type = eventType;

  // VALUE
  if (data.hasOwnProperty('count')) {
    request.value = data.count;
    delete data.count;
  }

  // WORKSPACE ID
  request.workspace = workspaceId;

  // USER ID (TRACKED USER)
  if (userId && !data.hasOwnProperty('user_id')) {
    request.trackedUser = userId;
  } else if (data.hasOwnProperty('user_id')) {
    request.trackedUser = data.user_id;
    delete data.user_id;
  }

  // OBJECT ID
  if (objectId && !data.hasOwnProperty('object_id')) {
    request.objectId = objectId;
  } else if (data.hasOwnProperty('object_id')) {
    request.objectId = data.object_id;
    delete data.object_id;
  }

  // IS PUBLIC
  if (data.hasOwnProperty('isPublic')) {
    request.isPublic = data.isPublic;
    delete data.isPublic;
  }

  // DATA (aside from reserved keywords)
  request.data = data;

  try {
    console.log('REQUEST:', request);
    const response = await makeRequest('POST', `${baseUrl}/events/track`, request);
    return JSON.parse(response);
  } catch (error) {
    console.log('ERROR:', error);
    return error;
  }
};

exports.count = async data => {
  if (typeof data !== 'object') {
    return false;
  } else if (!workspaceId) {
    return false;
  }

  let request = {};

  // WORKSPACE ID
  request.workspaceId = workspaceId;

  // USER ID (TRACKED USER)
  if (userId && !data.hasOwnProperty('user_id')) {
    request.trackedUser = userId;
  } else if (data.hasOwnProperty('user_id')) {
    request.trackedUser = data.user_id;
  }

  // OBJECT ID
  if (objectId && !data.hasOwnProperty('object_id')) {
    request.objectId = objectId;
  } else if (data.hasOwnProperty('object_id')) {
    request.objectId = data.object_id;
  }

  // TIMEFRAME
  if (data.hasOwnProperty('timeframe')) {
    request.timeframe = data.timeframe;
  }

  // EVENTS
  if (data.hasOwnProperty('events')) {
    request.events = data.events;
  }
  // TODO: Formulate the query to .count() endpoint;
  /*
  * PAYLOAD:
  *
  * {
  *   events: [
  *     "visit",
  *     "click"
  *   ],
  *   timeframe: "today"
  * }
  *
  * */

  try {
    console.log('REQUEST:', request);
    const response = await makeRequest('POST', `${baseUrl}/analyze/count`, request);
    return JSON.parse(response);
  } catch (error) {
    console.log('ERROR:', error);
    return error;
  }
};

exports.identify = async (user_id, object_id) => {
  if (workspaceId) {
    userId = user_id;
    objectId = object_id;
    return true;
  } else {
    return false;
  }
};

function makeRequest(method, url, data) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    if (data) {
      xhr.send(JSON.stringify(data));
    } else {
      xhr.send();
    }
  });
}
