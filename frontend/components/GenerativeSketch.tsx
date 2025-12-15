'use client';

import { useRef, useEffect } from 'react';

class Particle {
  x: number;
  y: number;
  size: number;
  baseX: number;
  baseY: number;
  density: number;
  color: string;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.size = 1;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = Math.random() * 30 + 1;
    this.color = color;
  }

  update(mouseX: number, mouseY: number) {
    let dx = mouseX - this.x;
    let dy = mouseY - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let forceDirectionX = dx / distance;
    let forceDirectionY = dy / distance;
    let maxDistance = 100;
    let force = (maxDistance - distance) / maxDistance;
    let directionX = forceDirectionX * force * this.density;
    let directionY = forceDirectionY * force * this.density;

    if (distance < maxDistance) {
      this.x -= directionX;
      this.y -= directionY;
    } else {
      if (this.x !== this.baseX) {
        let dx = this.x - this.baseX;
        this.x -= dx / 10;
      }
      if (this.y !== this.baseY) {
        let dy = this.y - this.baseY;
        this.y -= dy / 10;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}

const GenerativeSketch = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageUrl = `/api/image-proxy?url=${encodeURIComponent('https://cdn.imgchest.com/files/3dc31f9dc463.png')}`;
  let particles: Particle[] = [];
  let mouseX = -1000;
  let mouseY = -1000;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const image = new Image();
    image.src = imageUrl;

    const init = () => {
        const imageWidth = image.width;
        const imageHeight = image.height;
        const aspectRatio = imageWidth / imageHeight;
    
        let canvasWidth = window.innerWidth;
        let canvasHeight = window.innerHeight;
        let drawnWidth, drawnHeight, offsetX, offsetY;
    
        if (canvasWidth / canvasHeight > aspectRatio) {
            drawnWidth = canvasWidth;
            drawnHeight = canvasWidth / aspectRatio;
            offsetX = 0;
            offsetY = (canvasHeight - drawnHeight) / 2;
        } else {
            drawnHeight = canvasHeight;
            drawnWidth = canvasHeight * aspectRatio;
            offsetY = 0;
            offsetX = (canvasWidth - drawnWidth) / 2;
        }
    
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        ctx.drawImage(image, offsetX, offsetY, drawnWidth, drawnHeight);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        particles = [];
        for (let y = 0; y < imageData.height; y += 4) {
            for (let x = 0; x < imageData.width; x += 4) {
                const alpha = imageData.data[(y * imageData.width + x) * 4 + 3];
                if (alpha > 128) {
                    const r = imageData.data[(y * imageData.width + x) * 4];
                    const g = imageData.data[(y * imageData.width + x) * 4 + 1];
                    const b = imageData.data[(y * imageData.width + x) * 4 + 2];
                    const color = `rgb(${r},${g},${b})`;
                    particles.push(new Particle(x, y, color));
                }
            }
        }
    }
    

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update(mouseX, mouseY);
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    image.onload = () => {
      init();
      animate();
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };
    
    const handleResize = () => {
        init();
    }
      
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [imageUrl]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: 'black'
      }}
    />
  );
};

export default GenerativeSketch;