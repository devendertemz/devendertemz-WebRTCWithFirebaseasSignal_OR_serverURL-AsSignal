import axios from 'react-native-axios';
import {HttpRequestBaseURLConfig} from './Config';

const ConsoleLogUrlParaAndBody = (key, urlTmp, params, body) => {
  console.log(`\u001b[1;34m ${key} : urlTmp = `, urlTmp);
  if (params) {
    console.log('\u001b[1;34m params = ', JSON.stringify(params));
  }
  if (body) {
    console.log('\u001b[1;34m body = ', JSON.stringify(body));
  }
};
export const PostProfileUpdate = async (body, para) => {
  const urlTmp = HttpRequestBaseURLConfig.baseURLHost + '/update';
  ConsoleLogUrlParaAndBody('Preferences Update', urlTmp, para, body);
  const response = await axios({
    method: 'post',
    data: body,
    url: urlTmp,
    params: para,
  });
  return response;
};
