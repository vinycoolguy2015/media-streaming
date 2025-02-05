import type { OutputGroup } from '@aws-sdk/client-mediaconvert';

export const hls = (bucketDestination: string): OutputGroup => ({
  Name: 'Apple HLS',
  OutputGroupSettings: {
    Type: 'HLS_GROUP_SETTINGS',
    HlsGroupSettings: {
      SegmentLength: 10,
      MinSegmentLength: 0,
      // Destination: `s3://${bucketDestination}/hls/`,
      Destination: `s3://${bucketDestination}`,
    },
  },
  Outputs: [
    {
      Preset: 'System-Avc_16x9_720p_29_97fps_3500kbps',
      NameModifier: '_720',
    },
  ],
});

export const dash = (bucketDestination: string): OutputGroup => ({
  Name: 'DASH ISO',
  OutputGroupSettings: {
    Type: 'DASH_ISO_GROUP_SETTINGS',
    DashIsoGroupSettings: {
      SegmentLength: 30,
      FragmentLength: 2,
      Destination: `s3://${bucketDestination}/dash/`,
    },
  },
  Outputs: [
    {
      NameModifier: '_720',
      Preset: 'System-Ott-Dash-Mpd_Av1_1280x720p_24Hz_1Mbps_Qvbr_Vq6',
    },
    {
      AudioDescriptions: [
        {
          CodecSettings: {
            Codec: 'AAC',
            AacSettings: {
              Bitrate: 96000,
              CodingMode: 'CODING_MODE_2_0',
              SampleRate: 48000,
            },
          },
          AudioSourceName: 'Audio Selector 1',
        },
      ],
      ContainerSettings: {
        Container: 'MPD',
      },
      NameModifier: '_audio',
    },
  ],
});
