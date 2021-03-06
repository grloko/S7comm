const Client = require('azure-iot-device').Client
const Message = require('azure-iot-device').Message
const Mqtt = require('azure-iot-device-mqtt').Mqtt
const config = require('./config.json')
const fs = require('fs')

let client = null
let filenameError = './output/notsent/error.txt'

var connectToIoTHub = function(message) {
    if (!client) {
        console.log('Connection to IoT Hub not established yet, connecting!')
        client = Client.fromConnectionString(config.azure.connString, Mqtt)
        client.open((err) => {
            if (err) {
                console.log('Could not connect: ' + err.message)
            } else {
                console.log('Connected to Azure IoT Hub.')
                client.on('error', (err) => {
                    console.log(err.message)
                })
                client.on('disconnect', () => {
                    disconnectFromIoTHub()
                })
            }
        })
    }
    sendData(message)
}

function sendData(data) {
    var message = new Message(data)
    client.sendEvent(message, (err, res) => {
        if (err) {
            console.log('Error while trying to send message: ' + err.toString())
            let errorMessage = JSON.stringify(data) + '\n'
            fs.appendFileSync(filenameError, errorMessage)
        } else {
            console.log('Message sent\n   Payload: ' + data.toString())
        }
    })
}

function disconnectFromIoTHub() {
    if (client) {
        console.log('Disconnecting from Azure IoT Hub')
        client.removeAllListeners()
        client.close(printResultFor('close'))
        client = null
    }
}

function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString())
        if (res) console.log(op + ' status: ' + res.constructor.name)
    }
}

exports.send = connectToIoTHub
