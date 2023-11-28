const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("Create API Called");
  const fileId = uuidv4(); // Generate unique ID
  const s3Params = {
    Bucket: "csci5409-term-project-bucket",
    Key: `${fileId}.html`,
    Body: "",
    ContentType: "text/html",
  };

  // Add file to S3
  await s3.putObject(s3Params).promise();

  // Add entry to DynamoDB
  const dbParams = {
    TableName: "term-project-DB",
    Item: { fileId: fileId },
  };
  await dynamoDB.put(dbParams).promise();

  return {
    statusCode: 200,
    fileId: fileId,
  };
};
