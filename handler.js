'use strict';
import {v4 as uuid} from 'uuid';
import AWS from 'aws-sdk';

const dynamo = new AWS.DynamoDB.DocumentClient();

const hello = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

const createAuction = async (event, context) => {
  const {title} = JSON.parse(event.body);
  const now = new Date();

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.ToString()
  }

  await dynamo.put({
    TableName: 'Auctions-Table',
    Item: auction
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
};

exports.hello = hello;
exports.createAuction = createAuction;
