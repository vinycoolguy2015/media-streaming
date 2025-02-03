data "aws_media_convert_queue" "default" {
  id = "Default"
}

resource "aws_iam_role" "media_convert" {
  name               = "media_convert_role"
  assume_role_policy = data.aws_iam_policy_document.media_convert_assume_role.json
}

resource "aws_iam_role_policy" "media_convert_role_policies" {
  role   = aws_iam_role.media_convert.name
  policy = data.aws_iam_policy_document.media_convert_access_s3.json
}

data "aws_iam_policy_document" "media_convert_assume_role" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["mediaconvert.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "media_convert_access_s3" {
  statement {
    effect    = "Allow"
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_object.encoded.arn}*"]
  }

  statement {
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_object.raw.arn}*"]
  }
}
