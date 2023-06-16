function getMeetingNumberAndPasswordFromUrl(url) {
    const splitUrl = url.split('?')[0];
  
    if (!splitUrl) {
      return {
        meetingNumber: null,
        password: null
      };
    }
  
    const meetingNumber = splitUrl.substring(splitUrl.lastIndexOf('/') + 1);
  
    const queryString = url.split('?')[1];
    const password = queryString ? queryString.split('pwd=')[1] : null;
  
    return {
      meetingNumber,
      password
    };
  }
  
  const url = 'https://success.zoom.us/j/96115203014?pwd=K2V6UndYVjNKU3JsYTZZVjdqdDRxUT09';
  const url2  = "https://pooja-onelogin-test.zoom.us/j/91330878065?pwd=c3gwWFlZZy9ydVNOaGF4eUtpNjkvZz09"
  
  const { meetingNumber, password } = getMeetingNumberAndPasswordFromUrl(url2);
  
  console.log('Meeting Number:', meetingNumber);
  console.log('Password:', password);