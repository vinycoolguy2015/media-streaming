data "archive_file" "convert_video_lambda" {
  type        = "zip"
  source_dir  = "lambda_init_code"
  output_path = "convert_video_lambda_function_payload.zip"
}

resource "aws_lambda_function" "convert_video" {
  function_name = "convert-video"
  filename      = data.archive_file.convert_video_lambda.output_path
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  role          = aws_iam_role.convert_video_lambda.arn
  environment {
    variables = {
      S3_BUCKET_DESTINATION = "s3://${aws_s3_bucket.bucket.bucket}/${aws_s3_object.encoded.key}"
      MEDIA_CONVERT_ROLE    = aws_iam_role.media_convert.arn
      MEDIA_CONVERT_QUEUE   = data.aws_media_convert_queue.default.name
    }
  }
}

resource "aws_iam_role" "convert_video_lambda" {
  name               = "convert-video-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy" "convert_video_lambda_policies" {
  role   = aws_iam_role.convert_video_lambda.name
  policy = data.aws_iam_policy_document.convert_video_lambda_role_policies.json
}

resource "aws_lambda_permission" "eventbridge" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.convert_video.function_name
  source_arn    = aws_cloudwatch_event_rule.new_media.arn
  principal     = "events.amazonaws.com"
}

