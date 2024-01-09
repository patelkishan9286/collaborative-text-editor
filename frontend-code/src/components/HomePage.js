import React, { useState, useEffect } from "react";
import { Button, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../HomePage.css";
import AWS from "aws-sdk";
const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    // Configure AWS SDK
    AWS.config.update({
      region: "", // Put your AWS Region here
      accessKeyId: "", // Put your AWS Access Key ID here
      secretAccessKey: "", // Put your AWS Secret Access Key here
    });

    // Function to fetch the API URL from Secrets Manager
    const fetchApiUrl = async () => {
      const client = new AWS.SecretsManager();
      try {
        const data = await client
          .getSecretValue({ SecretId: "MyAPIs" })
          .promise();
        const secret = JSON.parse(data.SecretString);
        setApiUrl(secret["create-file"]);
      } catch (error) {
        console.error("Error fetching API URL: ", error);
        message.error("Error fetching configuration. Please try again.");
      }
    };

    fetchApiUrl();
  }, []);

  const handleCreateFile = async () => {
    if (!apiUrl) {
      message.error("API URL not loaded. Please wait.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(apiUrl);
      const fileId = response.data.fileId;
      navigate(`/${fileId}`);
    } catch (error) {
      console.error("Error creating file: ", error);
      message.error("Error creating file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <h1 className="homepage-title">Collaborative Text Editor</h1>
      <h2 className="homepage-subtitle">
        Create, Edit, and Share Documents Seamlessly
      </h2>
      <p className="homepage-description">
        Jump right in and experience the ease of real-time collaborative
        editing. Create a document and invite your team to collaborate
        instantly.
      </p>
      <Button
        type="primary"
        onClick={handleCreateFile}
        loading={loading}
        className="create-button"
      >
        Start Creating
      </Button>
    </div>
  );
};

export default HomePage;
