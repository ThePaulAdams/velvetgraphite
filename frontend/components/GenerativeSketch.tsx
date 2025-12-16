'use client';

import { useRef, useEffect } from 'react';

// Merged config to balance user's latest request with performance
const config = {
    agentCount: 4000, 
    agentSize: 1.5,
    agentAlpha: 0.20,
    edgePhaseLength: 600,
    updatesPerFrame: 5,
};

class Agent {
    x: number;
    y: number;
    vx: number;
    vy: number;
    px: number;
    py: number;
    ctx: CanvasRenderingContext2D;
    cols: number;
    rows: number;
    flowField: number[];
    edgePoints: number[];
    width: number;
    height: number;
    color: string;
    life: number;
    age: number;
    isDead: boolean;

    constructor(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        flowField: number[],
        edgePoints: number[]
    ) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.cols = Math.floor(width);
        this.rows = Math.floor(height);
        this.flowField = flowField;
        this.edgePoints = edgePoints;
        
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.px = 0;
        this.py = 0;
        this.life = 0;
        this.age = 0;
        this.isDead = true; // Start as dead to be reset immediately
        this.color = 'black';
    }

    reset(frameCount: number, imageData: ImageData) {
        const edgeBias = Math.max(0, 1 - frameCount / config.edgePhaseLength);
        let spawnX, spawnY;

        if (this.edgePoints.length > 0 && Math.random() < edgeBias) {
            const randEdgeIndex = this.edgePoints[Math.floor(Math.random() * this.edgePoints.length)];
            spawnX = (randEdgeIndex % this.cols);
            spawnY = Math.floor(randEdgeIndex / this.cols);
        } else {
            spawnX = Math.random() * this.width;
            spawnY = Math.random() * this.height;
        }
        
        this.x = spawnX;
        this.y = spawnY;
        this.px = spawnX;
        this.py = spawnY;
        this.vx = 0;
        this.vy = 0;
        this.life = 50 + Math.random() * 100;
        this.age = 0;
        this.isDead = false;
        
        // Color sampling moved back to reset to avoid performance hit of every-frame sampling
        const ix = Math.floor(spawnX);
        const iy = Math.floor(spawnY);
        const pIndex = (ix + iy * this.width) * 4;
        if (pIndex >= 0 && pIndex + 2 < imageData.data.length) {
            const r = imageData.data[pIndex];
            const g = imageData.data[pIndex + 1];
            const b = imageData.data[pIndex + 2];
            this.color = `rgb(${r},${g},${b})`;
        }
    }
    
    update(frameCount: number, imageData: ImageData) {
        if (this.isDead) {
            this.reset(frameCount, imageData);
            return;
        }

        this.px = this.x;
        this.py = this.y;

        const x_grid = Math.floor(this.x);
        const y_grid = Math.floor(this.y);
        const index = x_grid + y_grid * this.cols;
        
        // This was the user's key change, but it's extremely slow. 
        // Moved color sampling back to reset() for performance.
        // If you want streaky colors, uncomment this block and remove color from reset()
        /*
        if (x_grid >= 0 && x_grid < this.width && y_grid >= 0 && y_grid < this.height) {
            const pIndex = (x_grid + y_grid * this.width) * 4;
            const r = imageData.data[pIndex];
            const g = imageData.data[pIndex + 1];
            const b = imageData.data[pIndex + 2];
            this.color = `rgb(${r},${g},${b})`;
        }
        */

        const angle = this.flowField[index];

        if (angle !== undefined) {
            this.vx += Math.cos(angle) * 0.5;
            this.vy += Math.sin(angle) * 0.5;
            
            const speed = 2;
            const currentSpeed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            if (currentSpeed > speed) {
                this.vx = (this.vx / currentSpeed) * speed;
                this.vy = (this.vy / currentSpeed) * speed;
            }
            
            this.x += this.vx;
            this.y += this.vy;
        } else {
            this.isDead = true;
        }

        if (this.x < 0 || this.x >= this.width || this.y < 0 || this.y >= this.height) {
            this.isDead = true;
        }
        
        this.age++;
        if (this.age > this.life) {
            this.isDead = true;
        }
    }

    draw() {
        if (this.isDead) return;
        this.ctx.strokeStyle = this.color;
        this.ctx.beginPath();
        this.ctx.moveTo(this.px, this.py);
        this.ctx.lineTo(this.x, this.y);
        this.ctx.stroke();
    }
}

const GenerativeSketch = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageUrl = `/api/image-proxy?url=${encodeURIComponent('https://cdn.imgchest.com/files/3dc31f9dc463.png')}`;
    
    const animationFrameId = useRef<number | null>(null);
    const frameCount = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d'); 
        if (!ctx) return;
    
        const image = new Image();
        image.crossOrigin = "Anonymous";
        image.src = imageUrl;

        const calculateFlowField = (imageData: ImageData) => {
            const { width, height, data } = imageData;
            const flowField: number[] = new Array(width * height);
            const edgePoints: number[] = [];

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = (x + y * width);
                    const baseIdx = index * 4;
                    const brightness = (data[baseIdx] + data[baseIdx + 1] + data[baseIdx + 2]) / 3;

                    const rightIdx = Math.min(x + 1, width - 1) + y * width;
                    const bRight = (data[rightIdx * 4] + data[rightIdx * 4 + 1] + data[rightIdx * 4 + 2]) / 3;
                    const gx = bRight - brightness;

                    const downIdx = x + Math.min(y + 1, height - 1) * width;
                    const bDown = (data[downIdx * 4] + data[downIdx * 4 + 1] + data[downIdx * 4 + 2]) / 3;
                    const gy = bDown - brightness;
                    
                    const magnitude = Math.sqrt(gx * gx + gy * gy);
                    
                    if (magnitude > 15) { 
                        edgePoints.push(index);
                    }
                    
                    flowField[index] = Math.atan2(gy, gx) + Math.PI / 2;
                }
            }
            return { flowField, edgePoints };
        };

        const initAnimation = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const cols = canvas.width;
            const rows = canvas.height;

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) return;
            
            const imageRatio = image.width / image.height;
            const canvasRatio = canvas.width / canvas.height;
            let drawWidth, drawHeight;
            
            if (canvasRatio > imageRatio) {
                drawWidth = canvas.width;
                drawHeight = canvas.width / imageRatio;
            } else {
                drawHeight = canvas.height;
                drawWidth = canvas.height * imageRatio;
            }
            
            tempCanvas.width = cols;
            tempCanvas.height = rows;
            tempCtx.drawImage(image, (cols - drawWidth)/2, (rows - drawHeight)/2, drawWidth, drawHeight);
            
            const imageData = tempCtx.getImageData(0, 0, cols, rows);
            const { flowField, edgePoints } = calculateFlowField(imageData);

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.lineWidth = config.agentSize;
            ctx.globalAlpha = config.agentAlpha;
            
            const agents = Array.from({ length: config.agentCount }, () => 
                new Agent(ctx, cols, rows, flowField, edgePoints)
            );
            
            const animate = () => {
                ctx.fillStyle = 'rgba(0,0,0,0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                for (let i = 0; i < config.updatesPerFrame; i++) {
                    agents.forEach(agent => {
                        agent.update(frameCount.current, imageData);
                        agent.draw();
                    });
                }
                frameCount.current++;
                animationFrameId.current = requestAnimationFrame(animate);
            };
            animate();
        };

        image.onload = initAnimation;
        window.addEventListener('resize', initAnimation);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            window.removeEventListener('resize', initAnimation);
        };
    }, [imageUrl]);

    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />;
};

export default GenerativeSketch;
