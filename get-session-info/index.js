const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const REGION = process.env.AWS_REGION || "ap-south-1";
const TABLE_NAME = "UserSessions";

const dynamo = new DynamoDB({ region: REGION });

const lambdaHandler = async (event) => {
  const currentTime = Date.now();
  const key = marshall({ sessionId: event.sessionId });

  const response = await dynamo.getItem({
    TableName: TABLE_NAME,
    Key: key,
  });

  let session = unmarshall(response.Item);

  if (currentTime >= session.expires) {
    if (session.isActive) {
      // invalidate session if session is active and it is expired
      dynamo.updateItem({
        TableName: TABLE_NAME,
        Key: key,
        UpdateExpression: "SET isActive = :isActive",
        ExpressionAttributeValues: marshall({
          isActive: false,
        }),
      });

      // return update session info
      return { ...session, isActive: false };
    }

    return session;
  }

  const newExpires = currentTime + 1000 * 60 * 60 * 24 * 14; // 14 days from now
  // extend session
  dynamo.updateItem({
    TableName: TABLE_NAME,
    Key: key,
    UpdateExpression: "SET expires = :expires",
    ExpressionAttributeValues: marshall({
      ":expires": newExpires,
    }),
  });

  // return session info with new expiry date
  return { ...session, expires: newExpires };
};

module.exports = { lambdaHandler };
