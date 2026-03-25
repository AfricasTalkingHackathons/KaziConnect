const credentials = {
    apiKey: process.env.AT_API_KEY || 'sandbox',
    username: process.env.AT_USERNAME || 'sandbox',
};

const AfricasTalking = require('africastalking')(credentials);
const sms = AfricasTalking.SMS;

exports.sendSMS = async (to, message) => {
    try {
        if (!process.env.AT_API_KEY) {
            console.log(`[MOCK SMS] To: ${to} | Message: ${message}`);
            return;
        }
        const sendOptions = {
            to: [to],
            message: message
        };
        if (process.env.AT_SENDER_ID) {
            sendOptions.from = process.env.AT_SENDER_ID;
        }
        const result = await sms.send(sendOptions);
        console.log("SMS Sent: ", result);
    } catch (err) {
        console.error("SMS Error: ", err);
    }
};
