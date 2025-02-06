import Video from 'next-video';
import Notflix from 'player.style/notflix/react';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Video
          src="https://d3pe3tswehp8bf.cloudfront.net/beach.m3u8"
          theme={Notflix}
        />
      </main>
    </div>
  );
}
