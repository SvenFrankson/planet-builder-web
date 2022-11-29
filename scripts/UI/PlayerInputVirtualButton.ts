/// <reference path="PlayerInput.ts"/>

class PlayerInputVirtualButton extends PlayerInput {

    public clientWidth: number = 100;
    public clientHeight: number = 100;
    public size: number = 10;
    public marginLeft: number = 10;
    public marginBottom: number = 10;
    public centerX: number = 20;
    public centerY: number = 20;

    public svg: SVGElement;

    public connectInput(callback?: (ev: PointerEvent) => void): void {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("viewBox", "0 0 1000 1000");

        this.clientWidth = document.body.clientWidth;
        this.clientHeight = document.body.clientHeight;
        let ratio = this.clientWidth / this.clientHeight;
        if (ratio > 1) {
            this.size = this.clientHeight * 0.25;
        }
        else {
            this.size = this.clientWidth * 0.25;
        }
        let margin = Math.min(50, this.size * 0.3);
        this.centerX = this.clientWidth * 0.5;
        this.centerY = this.clientHeight - this.size * 0.5 - margin;

        this.svg.style.display = "block";
        this.svg.style.position = "fixed";
        this.svg.style.width = this.size.toFixed(0) + "px";
        this.svg.style.height = this.size.toFixed(0) + "px";
        this.svg.style.zIndex = "2";
        this.svg.style.left = (this.clientWidth * 0.75 * 0.5).toFixed(0) + "px";
        this.svg.style.bottom = margin.toFixed(0) + "px";
        this.svg.style.overflow = "visible";
        this.svg.style.pointerEvents = "none";
        
        document.body.appendChild(this.svg);

        let base = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        base.setAttribute("cx", "500");
        base.setAttribute("cy", "500");
        base.setAttribute("r", "500");
        base.setAttribute("fill", "white");
        base.setAttribute("fill-opacity", "10%");
        base.setAttribute("stroke-width", "4");
        base.setAttribute("stroke", "white");      
        
        this.svg.appendChild(base);

        if (callback) {
            this.game.canvas.addEventListener("pointerdown", (ev: PointerEvent) => {
                let dx = this.clientXToDX(ev.clientX);
                let dy = this.clientYToDY(ev.clientY);
                if (dx * dx + dy * dy < 1) {
                    callback(ev);
                }
            });
        }
    }

    public clientXToDX(clientX: number): number {
        return (clientX - this.centerX) / (this.size * 0.5);
    }

    public clientYToDY(clientY: number): number {
        return - (clientY - this.centerY) / (this.size * 0.5);
    }

    public disconnect(): void {
        if (this.svg) {
            document.body.removeChild(this.svg);
        }
    }
}