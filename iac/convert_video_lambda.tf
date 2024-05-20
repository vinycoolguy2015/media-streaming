data "archive_file" "convert_video_lambda" {
  type        = "zip"
  source_file = "./lambda_init_code/index.mjs"
  output_path = "convert_video_lambda_function_payload.zip"
}

resource "aws_lambda_function" "convert_video" {
  function_name = "convert-video"
  filename      = data.archive_file.convert_video_lambda.output_path
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  role          = aws_iam_role.convert_video_lambda.arn
}

resource "aws_iam_role" "convert_video_lambda" {
  name               = "convert-video-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
  inline_policy {
    name   = "DefaultPolicy"
    policy = data.aws_iam_policy_document.convert_video_lambda_role_policies.json
  }
}

resource "aws_sns_topic_subscription" "topic_subscription" {
  topic_arn = aws_sns_topic.topic.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.convert_video.arn
}

resource "aws_lambda_permission" "sns_lambda" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.convert_video.arn
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.topic.arn
}
