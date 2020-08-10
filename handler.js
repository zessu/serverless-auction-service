import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import createError, { MethodNotAllowed } from 'http-errors';
import commonMiddleware from './commonMiddleware';

const dynamo = new AWS.DynamoDB.DocumentClient();

const hello = async (event) => ({
  statusCode: 200,
  body: JSON.stringify(
    {
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    },
    null,
    2,
  ),
});

// Use this code if you don't use the http event with the LAMBDA-PROXY integration
// return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
const createAuction = async (event) => {
  const { title } = event.body;
  const now = new Date();

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    highestBid: {
      amt: 0,
    },
  };

  try {
    await dynamo
      .put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
      })
      .promise();
  } catch (error) {
    return new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
};

const listAuctions = async () => {
  let result;
  try {
    result = await dynamo
      .scan({
        TableName: process.env.AUCTIONS_TABLE_NAME,
      })
      .promise();
  } catch (error) {
    return new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
  };
};

const getAuction = async (event) => {
  const { id } = event.pathParameters;
  let result;
  try {
    result = await dynamo
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
      })
      .promise();
  } catch (error) {
    return new createError.InternalServerError(error);
  }

  if (!result) { return new createError.NotFound(`could not find aution with id ${id}`); }

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
  };
};

const placeBid = async (event) => {
  const { id } = event.pathParameters;
  const { amount } = event.body;

  let result;
  try {
    result = await dynamo
      .update({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set highestBid.amount =:amount',
        ExpressionAttributeValues: {
          ':amount': amount,
        },
        ReturnValues: 'ALL_NEW',
      })
      .promise();
  } catch (error) {
    return new createError.InternalServerError(error);
  }
  const auction = result.Attributes;
  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
};

exports.hello = commonMiddleware(hello);
exports.createAuction = commonMiddleware(createAuction);
exports.listAuctions = commonMiddleware(listAuctions);
exports.getAuction = commonMiddleware(getAuction);
exports.getAuction = commonMiddleware(placeBid);
