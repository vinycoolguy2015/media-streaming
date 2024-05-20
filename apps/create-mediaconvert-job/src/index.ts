import {
  MediaConvertClient,
  CreateJobCommand,
} from '@aws-sdk/client-mediaconvert';
import { SNSEvent } from 'aws-lambda';

const mediaConvertRole = process.env.ROLE || '';
const streamingQueue = process.env.QUEUE || '';

export const handler = async (event: SNSEvent): Promise<void> => {
  const mediaConverter = new MediaConvertClient();

  const createJobCommand = new CreateJobCommand({
    Role: mediaConvertRole,
    Queue: streamingQueue,
    AccelerationSettings: {
      Mode: 'PREFERRED',
    },
    StatusUpdateInterval: 'SECONDS_60',
    Settings: {
      OutputGroups: [
        {
          Name: 'HLS',
          Outputs: [
            {
              NameModifier: '16x9_854x480p_1.5Mbps_qvbr',
              ContainerSettings: {
                Container: 'M3U8',
                M3u8Settings: {
                  AudioFramesPerPes: 4,
                  PcrControl: 'PCR_EVERY_PES_PACKET',
                  PmtPid: 480,
                  PrivateMetadataPid: 503,
                  ProgramNumber: 1,
                  PatInterval: 0,
                  PmtInterval: 0,
                  VideoPid: 481,
                  AudioPids: [
                    482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493,
                    494, 495, 496, 497, 498,
                  ],
                },
              },
              VideoDescription: {
                ScalingBehavior: 'DEFAULT',
                Width: 854,
                Height: 480,
                TimecodeInsertion: 'DISABLED',
                AntiAlias: 'ENABLED',
                Sharpness: 100,
                AfdSignaling: 'NONE',
                DropFrameTimecode: 'ENABLED',
                RespondToAfd: 'NONE',
                ColorMetadata: 'INSERT',
                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    InterlaceMode: 'PROGRESSIVE',
                    ParNumerator: 1,
                    NumberReferenceFrames: 3,
                    Syntax: 'DEFAULT',
                    GopClosedCadence: 1,
                    HrdBufferInitialFillPercentage: 90,
                    GopSize: 3,
                    Slices: 1,
                    GopBReference: 'ENABLED',
                    HrdBufferSize: 4000000,
                    MaxBitrate: 2000000,
                    SlowPal: 'DISABLED',
                    ParDenominator: 1,
                    SpatialAdaptiveQuantization: 'ENABLED',
                    TemporalAdaptiveQuantization: 'ENABLED',
                    FlickerAdaptiveQuantization: 'ENABLED',
                    EntropyEncoding: 'CABAC',
                    RateControlMode: 'QVBR',
                    QvbrSettings: {
                      QvbrQualityLevel: 7,
                    },
                    CodecProfile: 'HIGH',
                    Telecine: 'NONE',
                    MinIInterval: 0,
                    AdaptiveQuantization: 'MEDIUM',
                    CodecLevel: 'AUTO',
                    FieldEncoding: 'PAFF',
                    SceneChangeDetect: 'ENABLED',
                    QualityTuningLevel: 'SINGLE_PASS_HQ',
                    UnregisteredSeiTimecode: 'DISABLED',
                    GopSizeUnits: 'SECONDS',
                    ParControl: 'SPECIFIED',
                    NumberBFramesBetweenReferenceFrames: 5,
                    RepeatPps: 'DISABLED',
                    DynamicSubGop: 'ADAPTIVE',
                  },
                },
              },
              AudioDescriptions: [
                {
                  AudioTypeControl: 'FOLLOW_INPUT',
                  AudioSourceName: 'Audio Selector 1',
                  CodecSettings: {
                    Codec: 'AAC',
                    AacSettings: {
                      AudioDescriptionBroadcasterMix: 'NORMAL',
                      Bitrate: 64000,
                      RateControlMode: 'CBR',
                      CodecProfile: 'HEV1',
                      CodingMode: 'CODING_MODE_2_0',
                      RawFormat: 'NONE',
                      SampleRate: 48000,
                      Specification: 'MPEG4',
                    },
                  },
                  LanguageCodeControl: 'FOLLOW_INPUT',
                  AudioType: 0,
                },
              ],
            },
          ],
          OutputGroupSettings: {
            Type: 'HLS_GROUP_SETTINGS',
            HlsGroupSettings: {
              ManifestDurationFormat: 'INTEGER',
              SegmentLength: 10, // 10s length
              TimedMetadataId3Period: 10,
              CaptionLanguageSetting: 'OMIT',
              Destination: 'S3_DESTINATION',
              TimedMetadataId3Frame: 'PRIV',
              CodecSpecification: 'RFC_4281',
              OutputSelection: 'MANIFESTS_AND_SEGMENTS',
              ProgramDateTimePeriod: 600,
              MinSegmentLength: 0,
              DirectoryStructure: 'SINGLE_DIRECTORY',
              ProgramDateTime: 'EXCLUDE',
              SegmentControl: 'SEGMENTED_FILES',
              ManifestCompression: 'NONE',
              ClientCache: 'ENABLED',
              StreamInfResolution: 'INCLUDE',
            },
          },
        },
      ],
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
          FileInput: 'S3_BUCKET',
        },
      ],
    },
  });
};
