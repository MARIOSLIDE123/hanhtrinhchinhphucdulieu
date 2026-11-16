/**
 * Dịch vụ âm thanh tương tác cho ứng dụng DATA ADVENTURE
 * Phát âm thanh khi học sinh trả lời Đúng hoặc Chưa đúng
 */

class SoundService {
  private correctAudio: HTMLAudioElement | null = null;
  private incorrectAudio: HTMLAudioElement | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedMute = localStorage.getItem('DATA_ADVENTURE_MUTED');
        this.isMuted = savedMute === 'true';

        this.correctAudio = new Audio('/sounds/correct.mp3');
        this.incorrectAudio = new Audio('/sounds/incorrect.mp3');
        this.correctAudio.preload = 'auto';
        this.incorrectAudio.preload = 'auto';
      } catch (err) {
        console.warn('Không thể khởi tạo bộ phát âm thanh:', err);
      }
    }
  }

  /**
   * Phát âm thanh khi trả lời ĐÚNG
   */
  public playCorrect(): void {
    if (this.isMuted || !this.correctAudio) return;
    try {
      this.correctAudio.currentTime = 0;
      const promise = this.correctAudio.play();
      if (promise !== undefined) {
        promise.catch((err) => {
          // Trình duyệt chặn autoplay trước tương tác
          console.debug('Autoplay audio blocked:', err);
        });
      }
    } catch (err) {
      console.warn('Lỗi phát âm thanh đúng:', err);
    }
  }

  /**
   * Phát âm thanh khi trả lời SAI / CHƯA ĐÚNG
   */
  public playIncorrect(): void {
    if (this.isMuted || !this.incorrectAudio) return;
    try {
      this.incorrectAudio.currentTime = 0;
      const promise = this.incorrectAudio.play();
      if (promise !== undefined) {
        promise.catch((err) => {
          console.debug('Autoplay audio blocked:', err);
        });
      }
    } catch (err) {
      console.warn('Lỗi phát âm thanh sai:', err);
    }
  }

  /**
   * Bật / Tắt âm thanh
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('DATA_ADVENTURE_MUTED', String(this.isMuted));
    } catch {}
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const soundService = new SoundService();
