const { Lambda } = require("@aws-sdk/client-lambda");

const REGION = process.env.REGION || "ap-south-1";
const lambda = new Lambda({
  region: REGION,
  endpoint: "http://localhost:3001",
});

console.log(process.version);

const getSessionInfo = async () => {
  const testSessionId = "abcd-abcd-abcd";
  try {
    const sessionInfo = await lambda.invoke({
      FunctionName: "DeactivateSessionFunction",
      Payload: Buffer.from(
        JSON.stringify({
          sessionId:
            "332b1741d72c2d7adf51dea5275a9209e6d6bad482aa4a4ce8d1d9bfabb0b656",
        })
      ),
    });

    const payload = JSON.parse(
      new TextDecoder("utf-8").decode(sessionInfo.Payload)
    );
    console.log(payload);
    return payload;
  } catch (error) {
    console.log(error);
  }
};

getSessionInfo();
