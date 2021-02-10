const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const { SHA256 } = require("crypto-js");

// Use region specified in environment or default to ap-south-1
const REGION = process.env.AWS_REGION || "ap-south-1";
const TABLE_NAME = "UserSessions";

// Create instance of DynamoDB
const dynamo = new DynamoDB({ region: REGION });

const generateId = (userId) => {
  const hashInput = `${Date.now()}${userId}${Math.floor(
    Math.random() * 100000
  )}`;
  const generatedId = SHA256(hashInput, { outputLength: 32 }).toString();
  return generatedId;
};

const lambdaHandler = async (event) => {
  // The input to the lambda function is the user event
  const user = event;

  // Generate Session ID based on User ID
  const sessionId = generateId(user.id);
  const currentTime = Date.now();

  // Item to store in the database
  const sessionInfo = {
    sessionId: sessionId, // Primary Key
    userId: user.id,
    sessionStartTimestamp: currentTime, // Time the sesion was created
    isActive: true, // Whether the session is Active
    expires: currentTime + 1000 * 60 * 60 * 24 * 14, // Set expiry date of session to 14 days from now
    userInfo: user, // Store the additional user info provided
  };

  await dynamo.putItem({
    TableName: TABLE_NAME,
    Item: marshall(sessionInfo), // The Item we want to add
  });

  return sessionInfo;
};

module.exports = { lambdaHandler };
