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
    <!-- Snake Game UI -->
    <div class="game-container">
      <canvas #gameCanvas width="400" height="400"></canvas>
      <div class="score">Score: {{ score }}</div>
      <button (click)="startGame()">Start Game</button>
    </div>
  `,
  styles: [`
    .game-container { display: flex; flex-direction: column; align-items: center; }
    canvas { border: 2px solid #333; background: #fafafa; margin-bottom: 10px; }
    .score { font-size: 18px; margin-bottom: 10px; }
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

  ngAfterViewInit(): void {
    this.draw();
    window.addEventListener('keydown', this.handleKey.bind(this));
  }

  startGame(): void {
    this.snake = [{ x: 8, y: 10 }];
    this.direction = 'ArrowRight';
    this.nextDirection = 'ArrowRight';
    this.score = 0;
    this.placeBall();
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.gameLoop(), 120);
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
      alert('Game Over! Final Score: ' + this.score);
      return;
    }

    this.snake.unshift(head);

    // Eat ball
    if (head.x === this.ball.x && head.y === this.ball.y) {
      this.score++;
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
}

/*
Features:
- Simple snake game playable with arrow keys.
- Snake grows when eating the red ball.
- Game over on collision with walls or itself.
- Displays current score.
- Responsive to "Start Game" button.
*/