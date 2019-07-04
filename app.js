const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const axios = require('axios');
const DBapi = require('./cache');


io.on('connection', socket => {
    let city;
    let interval;
    console.log('user connected');
    socket.on('city choice', selectedCity => {
        city = selectedCity;
        if (city) {
            if (interval) clearInterval(interval);
            interval = setInterval(() => emitTemperatureForCity(socket, city), 2000);
            socket.on('disconnect', () => console.log('user disconnected'));
        }
    });
});

const emitTemperatureForCity = async (socket, city) => {
    try {
        if (!DBapi.hasRecord(city)) {
            await DBapi.setRecord(city, getApiRequest);
        }
        if (DBapi.hasRecord(city) && DBapi.isDirtyRecord(city)) {
            await DBapi.setRecord(city, getApiRequest);
        }
        const currCity = await DBapi.getRecord(city);
        socket.emit('ApiResponse', currCity.temperature);
    } catch (err) {
        console.error(`Error: ${err}`, err);
    }
};

const getApiRequest = async key => {
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${key}&appid=a44b2b0a79a636dbd1abdc0afb3f4211&units=metric`;
    const res = await axios.get(url);
    return res.data.main.temp;
};

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
http.listen(3040, () => console.log('listening on *:3040'));