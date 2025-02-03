data "aws_cloudwatch_event_bus" "default" {
  name = "default"
}

resource "aws_cloudwatch_event_rule" "new_media" {
  name           = "new_media_added"
  description    = "Rule to trigger when a new media is added to be converted to streaming"
  event_bus_name = data.aws_cloudwatch_event_bus.default.name


  event_pattern = jsonencode({
    source      = ["aws.s3"],
    detail-type = ["Object Created"],
    detail = {
      bucket = {
        name = ["${aws_s3_bucket.bucket.bucket}"]
      },
      object = {
        key = [{ "prefix" : "raw/" }]
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "target" {
  arn  = aws_lambda_function.convert_video.arn
  rule = aws_cloudwatch_event_rule.new_media.name
}
