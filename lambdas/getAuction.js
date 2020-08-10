import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamo = new AWS.DynamoDB.DocumentClient();

export default async function findAuctionById(id) {
  let auction;
  try {
    const result = await dynamo
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
      })
      .promise();
    auction = result.Item;
  } catch (error) {
    console.error(error);
    return new createError.InternalServerError(error);
  }

  if (!auction) { throw new createError.NotFound(`could not find auction with id ${id}`); }

  return auction;
}
