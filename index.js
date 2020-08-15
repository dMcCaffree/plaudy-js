const baseUrl = 'https://api.plaudy.com/v1';
window.userId = null;
window.objectId = null;
window.apiKey = null;

exports.init = (apiKey = '') => {
  window.apiKey = apiKey;
};

exports.identify = (user_id, object_id) => {
    window.userId = user_id;
    window.objectId = object_id;
    return true;
};

exports.track = (eventType, data = {}) => {
  if (!window.apiKey) {
    retryTrack(eventType, data);
    return false;
  }

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
  request.apiKey = window.apiKey;

  // USER ID (TRACKED USER)
  if (window.userId && !data.hasOwnProperty('user_id')) {
    request.trackedUser = window.userId;
  } else if (data.hasOwnProperty('user_id')) {
    request.trackedUser = data.user_id;
    delete data.user_id;
  }

  // OBJECT ID
  if (window.objectId && !data.hasOwnProperty('object_id')) {
    request.objectId = window.objectId;
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
    makeRequest('POST', `${baseUrl}/events/track`, request);
    return true;
  } catch (error) {
    console.log('ERROR:', error);
    return error;
  }
};

exports.count = async data => {
  if (typeof data !== 'object') {
    return false;
  } else if (!window.apiKey) {
    retryCount(data);
    return false;
  }

  let request = {};

  // WORKSPACE ID
  request.apiKey = window.apiKey;

  // USER ID (TRACKED USER)
  if (window.userId && !data.hasOwnProperty('user_id')) {
    request.trackedUser = window.userId;
  } else if (data.hasOwnProperty('user_id')) {
    request.trackedUser = data.user_id;
  }

  // OBJECT ID
  if (window.objectId && !data.hasOwnProperty('object_id')) {
    request.objectId = window.objectId;
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

  try {
    const response = await makeRequest('POST', `${baseUrl}/analyze/count`, request);
    return JSON.parse(response);
  } catch (error) {
    console.log('ERROR:', error);
    return error;
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

function retryTrack(eventType, data) {
  setTimeout(() => {
    exports.track(eventType, data);
  }, 100);
}

function retryCount(data) {
  setTimeout(() => {
    exports.count(data);
  }, 100);
}
