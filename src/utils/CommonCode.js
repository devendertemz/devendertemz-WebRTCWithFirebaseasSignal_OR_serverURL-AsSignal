import {useEffect, useState} from 'react';
import {showMsgAlert} from '../utils/Alert';
import {showMsgAlert} from '../utils/Alert';
import Validation from '../utils/Validation';

//#region UseDebounce
export const UseDebounce = (value, delay) => {
  const [debounceValue, setDebounceValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(function () {
      setDebounceValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debounceValue;
};
//#endregion

//#region showAPIError
export const showAPIError = (error, title) => {
  if (error.response) {
    console.error(
      'errResponse : status | data | ',
      error.response.status,
      JSON.stringify(error.response.data, null, 4),
    );
    const errResponse = error.response?.data;
    if (errResponse?.errors) {
      const error = errResponse.errors[0];
      showMsgAlert(error.message, title);
    } else {
      const msg = getAPIError(error.response.status, error.response);
      showMsgAlert(msg, title);
    }
  } else {
    showMsgAlert(error.message, title);
  }
};
const getAPIError = (code, msg) => {
  return code + JSON.stringify(msg);
};
//#endregion

//#region validateUrl
export const validateUrl = url => {
  const regex = new RegExp(Validation.validateUrl);
  return regex.test(url);
};
//#endregion
