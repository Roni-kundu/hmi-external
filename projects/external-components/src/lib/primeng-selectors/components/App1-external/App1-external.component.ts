import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

interface Point {
  x: number;
  y: number;
}

type Direction = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

@Component({
  selector: 'app1',
  template: `
    <!-- Snake Game UI with High Score, Difficulty, and Sound -->
    <div class="game-container">
      <canvas #gameCanvas width="400" height="400"
        (touchstart)="onTouchStart($event)" (touchmove)="onTouchMove($event)" (touchend)="onTouchEnd($event)">
      </canvas>
      <div class="score">Score: {{ score }} | High Score: {{ highScore }}</div>
      <div class="difficulty">
        <label for="diff">Difficulty:</label>
        <select id="diff" [(ngModel)]="difficulty" (change)="changeDifficulty()">
          <option *ngFor="let d of difficulties" [value]="d.value">{{ d.label }}</option>
        </select>
      </div>
      <button (click)="startGame()">Start Game</button>
      <audio #eatSound src="assets/eat.mp3"></audio>
      <audio #gameOverSound src="assets/gameover.mp3"></audio>
    </div>
  `,
  styles: [`
    .game-container { display: flex; flex-direction: column; align-items: center; }
    canvas { border: 2px solid #333; background: #fafafa; margin-bottom: 10px; touch-action: none; }
    .score { font-size: 18px; margin-bottom: 8px; }
    .difficulty { margin-bottom: 8px; }
    select { font-size: 16px; margin-left: 5px; }
    button { padding: 8px 16px; font-size: 16px; }
  `]
})
export class App1 extends CommonExternalComponent {
  private readonly gridSize: number = 20;
  private readonly tileCount: number = 20;
  private snake: Point[] = [];
  private direction: Direction = 'ArrowRight';
  private nextDirection: Direction = 'ArrowRight';
  private ball: Point = { x: 10, y: 10 };
  private intervalId: ReturnType<typeof setInterval> | null = null;
  public score: number = 0;
  public highScore: number = 0;
  public difficulty: string = 'normal';
  public difficulties = [
    { label: 'Easy', value: 'easy' },
    { label: 'Normal', value: 'normal' },
    { label: 'Hard', value: 'hard' }
  ];
  private speedMap: Record<string, number> = {
    easy: 160,
    normal: 110,
    hard: 70
  };
  private eatAudio!: HTMLAudioElement;
  private gameOverAudio!: HTMLAudioElement;

  // For touch controls
  private touchStartX: number = 0;
  private touchStartY: number = 0;

  ngAfterViewInit(): void {
    this.draw();
    window.addEventListener('keydown', this.handleKey.bind(this));
    this.eatAudio = document.querySelector('audio[src*="eat"]') as HTMLAudioElement;
    this.gameOverAudio = document.querySelector('audio[src*="gameover"]') as HTMLAudioElement;
    const savedHighScore = localStorage.getItem('snake_high_score');
    if (savedHighScore) this.highScore = Number(savedHighScore);
  }

  startGame(): void {
    this.snake = [{ x: 8, y: 10 }];
    this.direction = 'ArrowRight';
    this.nextDirection = 'ArrowRight';
    this.score = 0;
    this.placeBall();
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.gameLoop(), this.speedMap[this.difficulty]);
    this.draw();
  }

  changeDifficulty(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => this.gameLoop(), this.speedMap[this.difficulty]);
    }
  }

  private handleKey(event: KeyboardEvent): void {
    const key = event.key as Direction;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      if (this.isOppositeDirection(key)) return;
      this.nextDirection = key;
    }
  }

  private isOppositeDirection(newDir: Direction): boolean {
    return (
      (this.direction === 'ArrowUp' && newDir === 'ArrowDown') ||
      (this.direction === 'ArrowDown' && newDir === 'ArrowUp') ||
      (this.direction === 'ArrowLeft' && newDir === 'ArrowRight') ||
      (this.direction === 'ArrowRight' && newDir === 'ArrowLeft')
    );
  }

  private gameLoop(): void {
    this.direction = this.nextDirection;
    const head = { ...this.snake[0] };
    switch (this.direction) {
      case 'ArrowUp': head.y -= 1; break;
      case 'ArrowDown': head.y += 1; break;
      case 'ArrowLeft': head.x -= 1; break;
      case 'ArrowRight': head.x += 1; break;
    }

    // Check collision with wall or self
    if (
      head.x < 0 || head.x >= this.tileCount ||
      head.y < 0 || head.y >= this.tileCount ||
      this.snake.some(seg => seg.x === head.x && seg.y === head.y)
    ) {
      if (this.intervalId) clearInterval(this.intervalId);
      this.playGameOverSound();
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('snake_high_score', String(this.highScore));
      }
      alert('Game Over! Final Score: ' + this.score);
      return;
    }

    this.snake.unshift(head);

    // Eat ball
    if (head.x === this.ball.x && head.y === this.ball.y) {
      this.score++;
      this.playEatSound();
      this.placeBall();
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  private placeBall(): void {
    let newBall: Point;
    do {
      newBall = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount)
      };
    } while (this.snake.some(seg => seg.x === newBall.x && seg.y === newBall.y));
    this.ball = newBall;
  }

  private draw(): void {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = '#4caf50';
    for (const seg of this.snake) {
      ctx.fillRect(
        seg.x * this.gridSize,
        seg.y * this.gridSize,
        this.gridSize - 2,
        this.gridSize - 2
      );
    }

    // Draw ball
    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    ctx.arc(
      this.ball.x * this.gridSize + this.gridSize / 2,
      this.ball.y * this.gridSize + this.gridSize / 2,
      this.gridSize / 2 - 2,
      0, Math.PI * 2
    );
    ctx.fill();
  }

  private playEatSound(): void {
    if (this.eatAudio) {
      this.eatAudio.currentTime = 0;
      this.eatAudio.play().catch(() => {});
    }
  }

  private playGameOverSound(): void {
    if (this.gameOverAudio) {
      this.gameOverAudio.currentTime = 0;
      this.gameOverAudio.play().catch(() => {});
    }
  }

  // Touch controls for mobile
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  }

  onTouchMove(event: TouchEvent): void {
    // Prevent scrolling
    event.preventDefault();
  }

  onTouchEnd(event: TouchEvent): void {
    if (event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - this.touchStartX;
    const dy = event.changedTouches[0].clientY - this.touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30 && this.direction !== 'ArrowLeft') this.nextDirection = 'ArrowRight';
      else if (dx < -30 && this.direction !== 'ArrowRight') this.nextDirection = 'ArrowLeft';
    } else {
      if (dy > 30 && this.direction !== 'ArrowUp') this.nextDirection = 'ArrowDown';
      else if (dy < -30 && this.direction !== 'ArrowDown') this.nextDirection = 'ArrowUp';
    }
  }
}

/*
Features:
- Classic snake game with:
  - Growing snake, ball eating, and game over on collision.
  - High score tracking (localStorage).
  - Selectable difficulty levels (easy, normal, hard).
  - Sound effects for eating and game over.
  - Touch controls for mobile devices.
  - Current score and high score display.
*/