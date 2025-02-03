import {
  MediaConvertClient,
  CreateJobCommand,
  type CreateJobCommandOutput,
} from '@aws-sdk/client-mediaconvert';
import type { EventBridgeEvent, Handler, S3Event } from 'aws-lambda';
import { dash, hls } from './output_groups.js';

const mediaConvertRole = process.env.MEDIA_CONVERT_ROLE || '';
const streamingQueue = process.env.MEDIA_CONVERT_QUEUE || '';
const s3BucketDestination = process.env.S3_BUCKET_DESTINATION || '';

const mediaConverter = new MediaConvertClient({});

export const handler: Handler<
  EventBridgeEvent<'Object Created', S3Event>,
  void
> = async (
  event: EventBridgeEvent<'Object Created', S3Event>
): Promise<void> => {
  const jobPromises: Promise<CreateJobCommandOutput>[] = [];

  for (const record of event.detail.Records) {
    const bucketInput = record.s3.bucket;
    const key = record.s3.object.key;

    const fileInput = `${bucketInput}${key}`;

    const createJobCommand = new CreateJobCommand({
      Role: mediaConvertRole,
      Queue: streamingQueue,
      AccelerationSettings: {
        Mode: 'PREFERRED',
      },
      StatusUpdateInterval: 'SECONDS_60',
      Settings: {
        OutputGroups: [hls(s3BucketDestination), dash(s3BucketDestination)],
        Inputs: [
          {
            AudioSelectors: {
              'Audio Selector 1': {
                Offset: 0,
                DefaultSelection: 'DEFAULT',
                ProgramSelection: 1,
              },
            },
            VideoSelector: {
              ColorSpace: 'FOLLOW',
              Rotate: 'DEGREE_0',
              AlphaBehavior: 'DISCARD',
            },
            FilterEnable: 'AUTO',
            PsiControl: 'USE_PSI',
            FilterStrength: 0,
            DeblockFilter: 'DISABLED',
            DenoiseFilter: 'DISABLED',
            TimecodeSource: 'ZEROBASED',
            FileInput: fileInput,
          },
        ],
      },
    });

    jobPromises.push(mediaConverter.send(createJobCommand));
  }

  await Promise.all(jobPromises);
};
