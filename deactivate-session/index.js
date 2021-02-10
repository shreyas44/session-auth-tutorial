const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const REGION = process.env.AWS_REGION || "ap-south-1";
const TABLE_NAME = "UserSessions";

const dynamo = new DynamoDB({ region: REGION });

const lambdaHandler = async (event) => {
  const session = await dynamo.updateItem({
    TableName: TABLE_NAME,
    Key: marshall({
      sessionId: event.sessionId,
    }),
    UpdateExpression: "SET isActive = :isActive",
    ExpressionAttributeValues: marshall({
      ":isActive": false,
    }),
    ReturnValues: "ALL_NEW",
  });

  return unmarshall(session.Attributes);
};

module.exports = { lambdaHandler };
