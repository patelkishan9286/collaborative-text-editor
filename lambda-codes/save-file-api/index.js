const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const { fileId, htmlContent } = event;

  console.log("Received fileId: ", fileId);

  try {
    // Upload HTML content to S3
    const s3Params = {
      Bucket: "csci5409-term-project-bucket",
      Key: `${fileId}.html`, // Saving as .html file
      Body: htmlContent,
      ContentType: "text/html", // Setting content type as HTML
    };

    await s3.putObject(s3Params).promise();
    return {
      statusCode: 200,
      message: "File saved successfully",
    };
  } catch (error) {
    console.error("Error saving HTML file: ", error);
    return {
      statusCode: 500,
      error: "Error saving the file",
    };
  }
};
