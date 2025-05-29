export const handler = async (event: any) => {
  const message = "Hello world!";

  return {
    statusCode: 200,
    body: message,
  };
};
