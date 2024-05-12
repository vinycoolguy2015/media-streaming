resource "aws_sns_topic" "topic" {
  name   = "streaming-file-events"
  policy = data.aws_iam_policy_document.sns_topic_policy.json
}

data "aws_iam_policy_document" "sns_topic_policy" {
  policy_id = "${aws_sns_topic.topic.arn}/SNSS3NotificationPolicy"
  statement {
    sid    = "media-streaming-bucket-allow-send-messages"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["s3.amazonaws.com"]
    }
    actions = [
      "SNS:Publish",
    ]
    resources = [
      "${aws_sns_topic.topic.arn}",
    ]
    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values = [
        aws_s3_bucket.bucket.arn
      ]
    }
  }

  depends_on = [aws_sns_topic.topic, aws_s3_bucket.bucket]
}
