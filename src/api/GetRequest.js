import axios from 'react-native-axios';
import {HttpRequestBaseURLConfig} from './Config';

const ConsoleLogUrlParaAndBody = (key, urlTmp, params, body) => {
  console.log(`\u001b[1;34m${key} : urlTmp = `, urlTmp);
  if (params) {
    console.log('\u001b[1;34m params = ', JSON.stringify(params));
  }
  if (body) {
    console.log('\u001b[1;34m body = ', JSON.stringify(body));
  }
};

export const GetCountriesList = async () => {
  const urlTmp = HttpRequestBaseURLConfig.baseURLHost + 'country/list';
  ConsoleLogUrlParaAndBody('GET : Countries List ', urlTmp, null, null);
  const response = await axios({
    method: 'get',
    url: urlTmp,
  });
  return response;
};
export const GetTvChannelByCat = async para => {
  const urlTmp = HttpRequestBaseURLConfig.baseURLHost + 'channel/list';
  ConsoleLogUrlParaAndBody('Channel by cat', urlTmp, para, null);
  const response = await axios({
    method: 'get',
    params: para,
    url: urlTmp,
  });
  return response;
};
