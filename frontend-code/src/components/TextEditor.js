import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
import "../TextEditorStyles.css";
import { Modal, Button, Input, message, Form, Space, Spin } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import AWS from "aws-sdk";

const TextEditor = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [apiUrls, setApiUrls] = useState({});
  const [form] = Form.useForm();

  var modules = {
    toolbar: [
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
        { align: [] },
      ],
      [
        {
          color: [
            "#000000",
            "#e60000",
            "#ff9900",
            "#ffff00",
            "#008a00",
            "#0066cc",
            "#9933ff",
            "#ffffff",
            "#facccc",
            "#ffebcc",
            "#ffffcc",
            "#cce8cc",
            "#cce0f5",
            "#ebd6ff",
            "#bbbbbb",
            "#f06666",
            "#ffc266",
            "#ffff66",
            "#66b966",
            "#66a3e0",
            "#c285ff",
            "#888888",
            "#a10000",
            "#b26b00",
            "#b2b200",
            "#006100",
            "#0047b2",
            "#6b24b2",
            "#444444",
            "#5c0000",
            "#663d00",
            "#666600",
            "#003700",
            "#002966",
            "#3d1466",
            "custom-color",
          ],
        },
      ],
    ],
  };

  var formats = [
    "header",
    "height",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "color",
    "bullet",
    "indent",
    "link",
    "image",
    "align",
    "size",
  ];

  useEffect(() => {
    // Configure AWS SDK
    AWS.config.update({
      region: "", // Add your region
      accessKeyId: "", // Add your access key ID
      secretAccessKey: "", // Add your secret access key
    });

    // Function to fetch API URLs from Secrets Manager
    const fetchApiUrls = async () => {
      const client = new AWS.SecretsManager();
      try {
        const data = await client
          .getSecretValue({ SecretId: "MyAPIs" })
          .promise();
        const secret = JSON.parse(data.SecretString);
        setApiUrls(secret);
      } catch (error) {
        console.error("Error fetching API URLs: ", error);
        message.error("Error fetching configuration. Please try again.");
      }
    };

    fetchApiUrls();
  }, []);

  useEffect(() => {
    setLoading(true);
    const checkFileExists = async () => {
      try {
        const response = await axios.get(`${apiUrls["check-file"]}/${fileId}`);
        if (response.data.exists) {
          const fileContent = await axios.get(
            `${apiUrls["get-file"]}/${fileId}`
          );
          setContent(fileContent.data.content);
        } else {
          setIsModalVisible(true);
        }
      } catch (error) {
        console.error("Error fetching file: ", error);
        setIsModalVisible(true);
      } finally {
        setLoading(false);
      }
    };

    if (apiUrls["check-file"] && apiUrls["get-file"]) {
      checkFileExists();
    }
  }, [fileId, apiUrls]);

  const handleProcedureContentChange = (newContent) => {
    setContent(newContent);
  };

  const showInviteModal = () => {
    setInviteModalVisible(true);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleInvite = () => {
    form
      .validateFields()
      .then((values) => {
        Modal.confirm({
          title: "Send Invitations",
          content: "Are you sure you want to send the invitations?",
          onOk() {
            return new Promise(async (resolve, reject) => {
              try {
                const emails = values.emails.map((email) => email.email);
                await axios.post(`${apiUrls["send-email"]}`, {
                  emails: emails,
                  link: fileId,
                });
                message.success("Invitations sent successfully");
                setInviteModalVisible(false);
                form.resetFields();
                resolve();
              } catch (error) {
                console.error("Error sending invites:", error);
                message.error("Failed to send invitations");
                reject(error);
              }
            });
          },
          onCancel() {
            console.log("Cancel");
          },
        });
      })
      .catch((info) => {
        console.error("Validate Failed:", info);
      });
  };

  const editorStyle = {
    minHeight: "450px",
    maxHeight: "600px",
    // overflow: "auto",
    minWidth: "100vh",
    // maxWidth: "80%", // Limit the width to 80% of its container
    margin: "0 auto", // Center the editor in its container
  };

  const handleSaveContent = async () => {
    setLoading(true);
    try {
      await axios.put(`${apiUrls["save-file"]}`, {
        fileId: fileId,
        htmlContent: content,
      });
      message.success("Content saved successfully");
    } catch (error) {
      console.error("Error saving content:", error);
      message.error("Failed to save content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="text-editor-container">
        <h1 style={{ textAlign: "center", color: "#125360" }}>
          Collaborative Text Editor
        </h1>
        <div style={{ display: "grid", justifyContent: "center" }}>
          <ReactQuill
            theme="snow"
            modules={modules}
            formats={formats}
            placeholder="Write your content here...."
            onChange={handleProcedureContentChange}
            style={editorStyle}
            value={content}
          ></ReactQuill>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "55px",
          }}
        >
          <Button type="primary" onClick={handleSaveContent} className="button">
            Save Content
          </Button>
        </div>
        <Modal
          title="File Not Found"
          visible={isModalVisible}
          onOk={handleGoHome}
          onCancel={handleGoHome}
          footer={[
            <Button key="back" onClick={handleGoHome}>
              Go Back Home
            </Button>,
          ]}
        >
          <p>The file associated with this ID does not exist.</p>
        </Modal>
        <div style={{ textAlign: "center", margin: "13px" }}>
          <Button type="primary" onClick={showInviteModal} className="button">
            Invite Others to Collaborate
          </Button>
        </div>
        <Modal
          title="Invite Collaborators"
          visible={inviteModalVisible}
          onOk={handleInvite}
          onCancel={() => setInviteModalVisible(false)}
          okText="Send Invites"
        >
          <Form form={form} name="dynamic_email_form" autoComplete="off">
            <Form.List name="emails">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Space key={field.key} align="baseline">
                      <Form.Item
                        {...field}
                        name={[field.name, "email"]}
                        fieldKey={[field.fieldKey, "email"]}
                        rules={[
                          {
                            required: true,
                            message: "Please input an email address!",
                          },
                        ]}
                      >
                        <Input placeholder="Email address" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Email
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form>
        </Modal>
      </div>
    </Spin>
  );
};

export default TextEditor;
