// Default handler generated in AWS
export const handler = async (event) => {
  console.log('Received event ', event);
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };

  return response;
};
