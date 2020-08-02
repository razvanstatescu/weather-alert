const axios = require('axios');
const sgMail = require('@sendgrid/mail');
const CronJob = require('cron').CronJob;
const {SG_KEY, OPEN_WEATHER_KEY, FROM, TO} = require('./credentials');

sgMail.setApiKey(SG_KEY);

const cronJob = new CronJob('0 0 8 * * *', run);
cronJob.start();

async function run() {
    try {
        const weatherData = await getWeatherData('Bonn');

        if (weatherData.weather_id[0] === '5') {
            await sendEmail(weatherData.temp);
            console.log('Will rain, email sent!');
        } else {
            console.log('Today is not raining!');
        }
    } catch (e) {
        console.log('error', e);
    }
}

function getWeatherData(city) {
    return axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPEN_WEATHER_KEY}&units=metric`).then(result => {
        return {
            weather_id: result.data.weather[0].id + '',
            temp: result.data.main.temp
        };
    });
}

async function sendEmail(temp) {
    temp = Math.round(temp);

    const msg = {
        to: TO,
        from: FROM,
        subject: 'Weather Alert - Today will rain!',
        html: `Be sure to take an umbrella with you today because <b>will rain</b>.
                <br/>
                The temperature is ${temp}&#176;C right now.`
    };

    await sgMail.send(msg);
}
