var aws = require('aws-sdk');
// process.env.ENV_API

aws.config.update({
    "accessKeyId": process.env.AWS_ACCESS_KEY_ID,
    "secretAccessKey": process.env.AWS_SECRET_ACCESS_KEY,
    "region": process.env.AWS_REGION
});

var lowesSqs = {};

lowesSqs.setQueueName = function (name) {
    this.queueName = name;
};

lowesSqs.getQueueName = function () {
    if(this.queueName == undefined || this.queueName == null || this.queueName == ''){
        this.queueName = process.env.AWS_QUEUE_NAME || 'LowesNodeApiQueues';
    }
    return this.queueName;
};

lowesSqs.getQueueUrl = function () {
    return process.env.AWS_QUEUE_BASE_URL + this.getQueueName();
};

lowesSqs.sqs = new aws.SQS();

lowesSqs._next = function (err, result, next) {
    if(next != undefined && typeof next == 'function'){
        next(err, result);
    } else {
        if(err != null)
            console.log(err);
        else
            console.log(result);
    }
};

// create new queue
lowesSqs.create = function (next) {
    var params = {QueueName:process.env.AWS_QUEUE_NAME};
    lowesSqs.sqs.createQueue(params, function(err, data) {lowesSqs._next(err, data, next)});
};

// send new message to queue
lowesSqs.send = function (msg, next) {
    var params = {
        MessageBody: JSON.stringify(msg),
        QueueUrl: lowesSqs.getQueueUrl(),
        DelaySeconds: 0
    };
    lowesSqs.sqs.sendMessage(params, function(err, data) {lowesSqs._next(err, data, next)});
};

module.exports = lowesSqs;