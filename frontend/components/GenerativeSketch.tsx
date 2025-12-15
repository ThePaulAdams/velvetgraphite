'use client';

import { useRef, useEffect } from 'react';

const config = {
    agentCount: 8000, // Adjusted from 2000 to match previous high count
    agentSize: 0.5,   // Adjusted from 1.5 for a finer line, more agents means finer detail
    agentAlpha: 0.5, // Adjusted from 0.15 for faster fill effect
    edgePhaseLength: 800, // Kept previous value
    updatesPerFrame: 10, // Adjusted from 1 for faster perceived drawing speed
};

class Agent {
    x: number;
    y: number;
    vx: number;
    vy: number;
    px: number;
    py: number;
    ctx: CanvasRenderingContext2D;
    cols: number; // width of the grid (same as canvas.width)
    rows: number; // height of the grid (same as canvas.height)
    flowField: number[];
    edgePoints: number[];
    color: string;
    life: number;
    age: number;
    isDead: boolean;
    
    // imageData is now passed directly to update for dynamic color sampling
    
    constructor(
        ctx: CanvasRenderingContext2D,
        cols: number,
        rows: number,
        flowField: number[],
        edgePoints: number[]
    ) {
        this.ctx = ctx;
        this.cols = cols;
        this.rows = rows;
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
        this.isDead = false;
        this.color = 'black'; // Will be set on reset
        
        // Initial reset will set position and color
    }

    reset(frameCount: number, imageData: ImageData) {
        const edgeBias = Math.max(0, 1 - frameCount / config.edgePhaseLength);
        let spawnX, spawnY;

        // Spawn Logic: Bias towards edges early on
        if (this.edgePoints.length > 0 && Math.random() < edgeBias) {
            const randEdgeIndex = this.edgePoints[Math.floor(Math.random() * this.edgePoints.length)];
            spawnX = (randEdgeIndex % this.cols);
            spawnY = Math.floor(randEdgeIndex / this.cols);
        } else {
            spawnX = Math.random() * this.cols;
            spawnY = Math.random() * this.rows;
        }

        this.x = spawnX;
        this.y = spawnY;
        this.px = spawnX; // Set previous position to current position
        this.py = spawnY; // Set previous position to current position
        this.vx = 0;
        this.vy = 0;
        this.life = 50 + Math.random() * 100;
        this.age = 0;
        this.isDead = false;

        // Sample color at spawn point
        const ix = Math.floor(spawnX);
        const iy = Math.floor(spawnY);
        const index = (ix + iy * this.cols) * 4;
        // Check bounds before accessing imageData.data
        if (index >= 0 && index + 2 < imageData.data.length) {
            const r = imageData.data[index];
            const g = imageData.data[index + 1];
            const b = imageData.data[index + 2];
            this.color = `rgb(${r},${g},${b})`;
        } else {
            this.color = 'rgb(0,0,0)'; // Default to black if out of bounds
        }
    }
    
    update(frameCount: number, imageData: ImageData) {
        if (this.isDead) {
            this.reset(frameCount, imageData); // Reset if dead
            return;
        }

        this.px = this.x;
        this.py = this.y;

        const x_grid = Math.floor(this.x);
        const y_grid = Math.floor(this.y);
        const index = x_grid + y_grid * this.cols;
        
        // Physics & Flow Field
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

        // Bounds & Life Check
        if (this.x < 0 || this.x >= this.cols || this.y < 0 || this.y >= this.rows) {
            this.isDead = true;
        }
        
        this.age++;
        if (this.age > this.life) {
            this.isDead = true;
        }
    }

    draw() {
        if (this.isDead) return; // Only draw if not dead
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
    const agents = useRef<Agent[]>([]); // Use useRef for agents array

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d'); 
        if (!ctx) return;
    
        const image = new Image();
        image.crossOrigin = "Anonymous";
        image.src = imageUrl;

        const calculateFlowField = (imageData: ImageData, width: number, height: number) => {
            const data = imageData.data;
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
            
            tempCanvas.width = cols;
            tempCanvas.height = rows;

            const imageRatio = image.width / image.height;
            const canvasRatio = cols / rows;
            let drawWidth, drawHeight;
            
            // "Cover" logic for image
            if (canvasRatio > imageRatio) {
                drawWidth = cols;
                drawHeight = cols / imageRatio;
            } else {
                drawHeight = rows;
                drawWidth = rows * imageRatio;
            }
            
            tempCtx.drawImage(image, (cols - drawWidth)/2, (rows - drawHeight)/2, drawWidth, drawHeight);
            
            const imageData = tempCtx.getImageData(0, 0, cols, rows);
            const { flowField, edgePoints } = calculateFlowField(imageData, cols, rows);

            ctx.fillStyle = 'black'; // Background for initial clear
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.lineWidth = config.agentSize;
            ctx.globalAlpha = config.agentAlpha;
            
            // Initialize agents using the new constructor and data
            agents.current = Array.from({ length: config.agentCount }, () => 
                new Agent(ctx, cols, rows, flowField, edgePoints)
            );

            // Initial reset for all agents
            agents.current.forEach(agent => agent.reset(frameCount.current, imageData));

            const animate = () => {
                // Clear the main canvas gradually
                ctx.fillStyle = 'rgba(0,0,0,0.05)'; // Fading trail effect
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                for (let i = 0; i < config.updatesPerFrame; i++) {
                    agents.current.forEach(agent => {
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
        window.addEventListener('resize', initAnimation); // Re-initialize on resize

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