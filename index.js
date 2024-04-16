const config = require('./config');

// sends configuration to the frontend
function sendConfig() {
    // generate config to send to the frontend
    let postData = new FormData();
    postData.append('offline', false);
    postData.append('fixtures', JSON.stringify(require('./fixtures')));

    // make post request to front end to send config data
    fetch (`${config.crowdcontrolServer}/receiveConfig.php`, {
        method: 'POST',
        body: postData,
        
    }).then((res) => {
        console.log(`statusCode: ${res.statusCode}`);
        return res.text();
    }).then((data) => {
        console.log(data);
    })
    .catch((error) => {
        console.error(error);
    });
        
}


sendConfig();
const lighting = require('./lighting');
//lighting();