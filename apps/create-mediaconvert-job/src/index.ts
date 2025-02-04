import {
  MediaConvertClient,
  CreateJobCommand,
  type CreateJobCommandOutput,
} from '@aws-sdk/client-mediaconvert';
import type {
  EventBridgeEvent,
  Handler,
  S3Event,
  S3EventRecord,
  S3ObjectCreatedNotificationEventDetail,
} from 'aws-lambda';
import { dash, hls } from './output_groups.js';

const mediaConvertRole = process.env.MEDIA_CONVERT_ROLE || '';
const streamingQueue = process.env.MEDIA_CONVERT_QUEUE || '';
const s3BucketDestination = process.env.S3_BUCKET_DESTINATION || '';

const mediaConverter = new MediaConvertClient({});

export const handler: Handler<
  EventBridgeEvent<'Object Created', S3ObjectCreatedNotificationEventDetail>,
  void
> = async (
  event: EventBridgeEvent<
    'Object Created',
    S3ObjectCreatedNotificationEventDetail
  >
): Promise<void> => {
  const bucketInput = event.detail.bucket.name;
  const key = event.detail.object.key;

  const fileInput = `s3://${bucketInput}/${key}`;

  console.log('Starting convert job for file input %s', fileInput);

  const createJobCommand = new CreateJobCommand({
    Role: mediaConvertRole,
    Queue: streamingQueue,
    // AccelerationSettings: {
    //   Mode: 'PREFERRED',
    // },
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

  try {
    await mediaConverter.send(createJobCommand);
  } catch (error: any) {
    console.error('Failed creating media converter job', error);
  }

  console.log('Finished %s', fileInput);
};
