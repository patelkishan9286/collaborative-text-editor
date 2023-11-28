const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const fileId = event.pathParameters.fileId;

  const params = {
    TableName: "term-project-DB",
    Key: { fileId: fileId },
  };

  try {
    const result = await dynamoDB.get(params).promise();
    return {
      statusCode: 200,
      exists: !!result.Item,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      error: JSON.stringify(error),
    };
  }
};
