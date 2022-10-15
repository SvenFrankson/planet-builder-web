/// <reference path="PlayerInput.ts"/>

class PlayerInputVirtualPad extends PlayerInput {

    public clientWidth: number = 100;
    public clientHeight: number = 100;
    public size: number = 10;
    public marginLeft: number = 10;
    public marginBottom: number = 10;
    public centerX: number = 20;
    public centerY: number = 20;

    private _pointerDown: boolean = false;
    private _dx: number = 0;
    private _dy: number = 0;

    public pad: SVGCircleElement;

    public connectInput(left?: boolean): void {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 1000 1000");

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

        svg.style.display = "block";
        svg.style.position = "fixed";
        svg.style.width = this.size.toFixed(0) + "px";
        svg.style.height = this.size.toFixed(0) + "px";
        svg.style.zIndex = "2";
        if (left) {
            svg.style.left = margin.toFixed(0) + "px";
        }
        else {
            svg.style.right = margin.toFixed(0) + "px";
        }
        svg.style.bottom = margin.toFixed(0) + "px";
        svg.style.overflow = "visible";
        svg.style.pointerEvents = "none";
        
        document.body.appendChild(svg);

        let base = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        base.setAttribute("cx", "500");
        base.setAttribute("cy", "500");
        base.setAttribute("r", "500");
        base.setAttribute("fill", "white");
        base.setAttribute("fill-opacity", "10%");
        base.setAttribute("stroke-width", "4");
        base.setAttribute("stroke", "white");      
        
        svg.appendChild(base);

        this.pad = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.pad.setAttribute("cx", "500");
        this.pad.setAttribute("cy", "500");
        this.pad.setAttribute("r", "250");
        this.pad.setAttribute("fill", "white");
        this.pad.setAttribute("fill-opacity", "50%");
        this.pad.setAttribute("stroke-width", "4");
        this.pad.setAttribute("stroke", "white");      
        
        svg.appendChild(this.pad);

        if (left) {
            this.centerX = this.size * 0.5 + margin;
        }
        else {
            this.centerX = this.clientWidth - this.size * 0.5 - margin;
        }
        this.centerY = this.clientHeight - this.size * 0.5 - margin;

        this.game.canvas.addEventListener("pointerdown", (ev: PointerEvent) => {
            let dx = this.clientXToDX(ev.clientX);
            let dy = this.clientYToDY(ev.clientY);
            if (dx * dx + dy * dy < 1) {
                this._pointerDown = true;
                this._dx = dx;
                this._dy = dy;
                this.updatePad(this._dx, this._dy);
                this.updatePilot(this._dx, this._dy);
            }
        });

        this.game.canvas.addEventListener("pointermove", (ev: PointerEvent) => {
            if (this._pointerDown) {
                let dx = this.clientXToDX(ev.clientX);
                let dy = this.clientYToDY(ev.clientY);

                if (dx * dx + dy * dy < 1) {
                    this._dx = dx;
                    this._dy = dy;
                    this.updatePad(this._dx, this._dy);
                    this.updatePilot(this._dx, this._dy);
                }
                else if (dx * dx + dy * dy < 4) {
                    let l = Math.sqrt(dx * dx + dy * dy);
                    this._dx = dx / l;
                    this._dy = dy / l;
                    this.updatePad(this._dx, this._dy);
                    this.updatePilot(this._dx, this._dy);
                }
            }
        });

        this.game.canvas.addEventListener("pointerup", (ev: PointerEvent) => {
            this._pointerDown = false;
        });

        this.game.scene.onBeforeRenderObservable.add(this._update);
    }

    public clientXToDX(clientX: number): number {
        return (clientX - this.centerX) / (this.size * 0.5);
    }

    public clientYToDY(clientY: number): number {
        return - (clientY - this.centerY) / (this.size * 0.5);
    }

    private _update = () => {
        if (!this._pointerDown) {
            if (Math.abs(this._dx) > 0.001 || Math.abs(this._dy) > 0.001) {
                this._dx *= 0.9;
                this._dy *= 0.9;
                if (Math.abs(this._dx) > 0.001 || Math.abs(this._dy) > 0.001) {
                    this.updatePad(this._dx, this._dy);
                    this.updatePilot(this._dx, this._dy);
                }
                else {
                    this.updatePad(0, 0);
                    this.updatePilot(0, 0);
                }
            }
        }
    }

    public updatePad(dx: number, dy: number): void {
        let cx = 500 + dx * 250;
        this.pad.setAttribute("cx", cx.toFixed(1));
        
        let cy = 500 - dy * 250;
        this.pad.setAttribute("cy", cy.toFixed(1));
    }

    public updatePilot(dx: number, dy: number): void {}
}

class PlayerInputMovePad extends PlayerInputVirtualPad {

    public updatePilot(dx: number, dy: number): void {
        this.player.inputForward = dy;
        this.player.inputRight = dx;
    }
}

class PlayerInputHeadPad extends PlayerInputVirtualPad {

    public updatePilot(dx: number, dy: number): void {
        this.player.inputHeadUp = - dy * 0.7;
        this.player.inputHeadRight = dx * 0.7;
    }
}