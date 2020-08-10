import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddleware from './commonMiddleware';
import findAuctionById from './lambdas/getAuction';

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
    endingAt: new Date(now.getHours() + 1).toISOString(),
    highestBid: {
      amount: 0,
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

const getAuction = async (event) => {
  const { id } = event.pathParameters;
  const result = await findAuctionById(id);
  return {
    statusCode: 200,
    body: JSON.stringify(result),
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

const placeBid = async (event) => {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const auction = await findAuctionById(id);
  const highestBid = auction.highestBid.amount;
  let result;

  if (amount <= highestBid) {
    throw new createError.Forbidden(`your bid must be higher then ${highestBid}`);
  }

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
    throw new createError.InternalServerError(error);
  }

  const res = result.Attributes;
  return {
    statusCode: 200,
    body: JSON.stringify(res),
  };
};

exports.hello = commonMiddleware(hello);
exports.createAuction = commonMiddleware(createAuction);
exports.listAuctions = commonMiddleware(listAuctions);
exports.getAuction = commonMiddleware(getAuction);
exports.placeBid = commonMiddleware(placeBid);
