window.POE_TRADE_SNIPER_RUNNING = true;

async function goToHideout(token) {
  const res = await fetch('https://www.pathofexile.com/api/trade2/whisper', {
    headers: {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      priority: 'u=1, i',
      'x-requested-with': 'XMLHttpRequest',
    },
    referrer: window.location.href,
    body: JSON.stringify({ token }),
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Non 200 response');
  }

  const resData = await res.json();
  console.log('goToHideout response', resData);

  if (!resData.success) {
    throw new Error('Not success travel to hideout');
  }
}

let hideoutFlag = true;
let flagTimeout = 1000 * 20;
// monkey patch fetch
let originalFetch = window.fetch;
window.fetch = async (...args) => {
  //console.log("Request:", args);
  const [url] = args;

  const liveSearchId = (() => {
    const array = window.location.href.split('/');
    return array[array.length - 2];
  })();
  //console.log('liveSearchId', liveSearchId)
  //console.log('url', url)

  const response = await originalFetch(...args);

  // implement the money logic
  if (url.includes(liveSearchId)) {
    try {
      const clonedRes = response.clone();
      const resData = await clonedRes.json();

      console.log('Response:', resData);
      const hideoutToken = resData.result[0].listing.hideout_token;
      console.log('hideoutToken', hideoutToken);

      if (hideoutFlag) {
        hideoutFlag = false;
        console.log('going to hideout');
        await goToHideout(hideoutToken);
      } else {
        console.warn('hideout flag was set to false!');
      }
    } catch (error) {
      console.error(
        'Failed to snipe. another damn bot won. resetting hideoutFlag',
      );
      hideoutFlag = true;
    } finally {
      setTimeout(() => {
        hideoutFlag = true;
      }, flagTimeout);
    }
    // TODO: should reset flag on a timeout? edge cases like you are about to buy an item and timeout kicks in to reset flag when another search hits and travels you
  }

  return response;
};

console.log('poe trade sniper set. good luck');

/* 
- programmatic keyboard & mouse control - https://pyautogui.readthedocs.io/en/latest/
*/
