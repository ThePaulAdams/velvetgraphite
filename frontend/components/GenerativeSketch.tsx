'use client';

import { useRef, useEffect } from 'react';

const config = {
    agentCount: 2500,
    agentSize: 1,
    agentAlpha: 0.5,
    edgePhaseLength: 800, // frames
    stepLength: 0.5,
};

class Agent {
    x: number;
    y: number;
    ctx: CanvasRenderingContext2D;
    cols: number;
    rows: number;
    scale: number;
    flowField: number[];
    edgePoints: number[];
    imageData: ImageData;
    frameCount: number;
    color: string;

    constructor(
        ctx: CanvasRenderingContext2D,
        cols: number,
        rows: number,
        scale: number,
        flowField: number[],
        edgePoints: number[],
        imageData: ImageData,
        frameCount: number
    ) {
        this.ctx = ctx;
        this.cols = cols;
        this.rows = rows;
        this.scale = scale;
        this.flowField = flowField;
        this.edgePoints = edgePoints;
        this.imageData = imageData;
        this.frameCount = frameCount;
        this.x = 0;
        this.y = 0;
        this.color = 'white';
        this.reset();
    }

    reset() {
        const edgeBias = Math.max(0, 1 - this.frameCount / config.edgePhaseLength);
        let x, y;

        if (this.edgePoints.length > 0 && Math.random() < edgeBias) {
            const randEdgeIndex = this.edgePoints[Math.floor(Math.random() * this.edgePoints.length)];
            x = (randEdgeIndex % this.cols) * this.scale + Math.random() * this.scale;
            y = Math.floor(randEdgeIndex / this.cols) * this.scale + Math.random() * this.scale;
        } else {
            x = Math.random() * this.cols * this.scale;
            y = Math.random() * this.rows * this.scale;
        }
        this.x = x;
        this.y = y;

        // Sample color
        const ix = Math.floor(x / this.scale);
        const iy = Math.floor(y / this.scale);
        const index = (ix + iy * this.cols) * 4;
        const r = this.imageData.data[index];
        const g = this.imageData.data[index + 1];
        const b = this.imageData.data[index + 2];
        this.color = `rgb(${r},${g},${b})`;
    }
    
    update() {
        const x_grid = Math.floor(this.x / this.scale);
        const y_grid = Math.floor(this.y / this.scale);
        const index = x_grid + y_grid * this.cols;
        const angle = this.flowField[index];

        if (angle !== undefined) {
            this.x += Math.cos(angle) * config.stepLength;
            this.y += Math.sin(angle) * config.stepLength;
        } else {
            this.reset();
        }

        if (this.x < 0 || this.x > this.cols * this.scale || this.y < 0 || this.y > this.rows * this.scale) {
            this.reset();
        }

        this.frameCount++;
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, config.agentSize, config.agentSize);
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
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
    
        const image = new Image();
        image.src = imageUrl;

        const calculateFlowField = (imageData: ImageData) => {
            const { width, height, data } = imageData;
            const flowField: number[] = new Array(width * height);
            const edgePoints: number[] = [];

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = (x + y * width);
                    const r = data[index * 4];
                    const g = data[index * 4 + 1];
                    const b = data[index * 4 + 2];
                    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                    const gx = (data[((x + 1) + y * width) * 4] || 0) - (data[((x - 1) + y * width) * 4] || 0);
                    const gy = (data[(x + (y + 1) * width) * 4] || 0) - (data[(x + (y - 1) * width) * 4] || 0);
                    
                    const magnitude = Math.sqrt(gx * gx + gy * gy);
                    if (magnitude > 30) { 
                        edgePoints.push(index);
                    }
                    
                    flowField[index] = brightness / 255 * Math.PI * 4;
                }
            }
            return { flowField, edgePoints };
        };

        image.onload = () => {
            const scale = 2; // Further optimize by using a larger scale
            const cols = Math.floor(window.innerWidth / scale);
            const rows = Math.floor(window.innerHeight / scale);
            canvas.width = cols * scale;
            canvas.height = rows * scale;
        
            const tempCtx = document.createElement('canvas').getContext('2d');
            if (!tempCtx) return;
            tempCtx.canvas.width = cols;
            tempCtx.canvas.height = rows;

            const imageAspectRatio = image.width / image.height;
            const canvasAspectRatio = cols / rows;
            let drawWidth, drawHeight, offsetX, offsetY;

            if (imageAspectRatio > canvasAspectRatio) {
                drawWidth = cols;
                drawHeight = cols / imageAspectRatio;
                offsetX = 0;
                offsetY = (rows - drawHeight) / 2;
            } else {
                drawHeight = rows;
                drawWidth = rows * imageAspectRatio;
                offsetY = 0;
                offsetX = (cols - drawWidth) / 2;
            }
            tempCtx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
            const imageData = tempCtx.getImageData(0, 0, cols, rows);
            const { flowField, edgePoints } = calculateFlowField(imageData);

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = config.agentAlpha;
            
            const agents = Array.from({ length: config.agentCount }, () => new Agent(ctx, cols, rows, scale, flowField, edgePoints, imageData, frameCount.current));

            const animate = () => {
                if (frameCount.current < config.edgePhaseLength + 2000) { 
                    agents.forEach(agent => {
                        agent.update();
                        agent.draw();
                        agent.frameCount = frameCount.current;
                    });
                    frameCount.current++;
                    animationFrameId.current = requestAnimationFrame(animate);
                }
            };
            animate();
        };

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [imageUrl]);

    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />;
};

export default GenerativeSketch;