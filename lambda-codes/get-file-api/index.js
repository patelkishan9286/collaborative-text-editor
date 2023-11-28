const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const fileId = event.pathParameters.fileId;

  const s3Params = {
    Bucket: "csci5409-term-project-bucket",
    Key: `${fileId}.html`, // Updated for HTML files
  };

  try {
    const s3Data = await s3.getObject(s3Params).promise();

    // Check if the file is empty
    if (s3Data.ContentLength === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ content: "" }),
      };
    }

    const htmlContent = s3Data.Body.toString("utf-8");

    return {
      statusCode: 200,
      content: htmlContent,
    };
  } catch (error) {
    console.error("Error retrieving HTML file: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error retrieving HTML file" }),
    };
  }
};
