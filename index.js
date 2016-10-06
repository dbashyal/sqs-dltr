var aws = require('aws-sdk');

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

lowesSqs._next = function (err, result, next, msg) {
    if(next != undefined && typeof next == 'function'){
        next(err, result, msg);
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
    lowesSqs.sqs.createQueue(params, function(err, result) {lowesSqs._next(err, result, next)});
};

// send new message to queue
lowesSqs.send = function (msg, next) {
    var params = {
        MessageBody: JSON.stringify(msg),
        QueueUrl: lowesSqs.getQueueUrl(),
        DelaySeconds: 0
    };
    lowesSqs.sqs.sendMessage(params, function(err, result) {lowesSqs._next(err, result, next, msg)});
};

// receive messages
lowesSqs.receive = function (next) {
    var params = {
        QueueUrl: lowesSqs.getQueueUrl(),
        MaxNumberOfMessages: 10,
        VisibilityTimeout: 600 // Wait time for anyone else to process. (seconds)
    };
    lowesSqs.sqs.receiveMessage(params, function(err, result) {lowesSqs._next(err, result, next)});
};

// delete processed message
lowesSqs.delete = function (receipt, next) {
    var params = {
        QueueUrl: lowesSqs.getQueueUrl(),
        ReceiptHandle: receipt
    };
    lowesSqs.sqs.deleteMessage(params, function(err, result) {lowesSqs._next(err, result, next)});
};

module.exports = lowesSqs;
