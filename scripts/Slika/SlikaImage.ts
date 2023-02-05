class SlikaImage extends SlikaElement {

    private _img: HTMLImageElement;
    private _isLoaded: boolean = false;
    public size: number = 1;

    private _url: string;
    public get url(): string {
        return this._url;
    }
    public set url(s: string) {
        if (s != this._url) {
            this._isLoaded = false;
            this._url = s;

            if (this._url != "") {
                this._img = new Image();
                this._img.src = this._url;
                this._img.onload = () => {
                    this._isLoaded = true;
                };
            }
        }
    }

    public get isVisible(): boolean {
        return this.display && this.size != 0;
    }

    constructor(
        public p: SPosition = new SPosition(),
        public w: number,
        public h: number,
        url: string
    ) {
        super();
        this.url = url;
    }

    public redraw(context: BABYLON.ICanvasRenderingContext): void {
        if (this.url != "") {
            let hsf = Config.performanceConfiguration.holoScreenFactor;
            
            if (this._isLoaded) {
                context.drawImage(this._img, (this.p.x - this.w * 0.5 * this.size) * hsf, (this.p.y - this.h * 0.5 * this.size) * hsf, (this.w * this.size) * hsf, (this.h * this.size) * hsf);
            }
            else {
                requestAnimationFrame(() => {
                    this.redraw(context);
                })
            }
        }
    }

    private _animateSizeCB: () => void;
    public async animateSize(sizeTarget: number, duration: number = 1): Promise<void> {
        if (this.scene) {
            if (this._animateSizeCB) {
                this.scene.onBeforeRenderObservable.removeCallback(this._animateSizeCB);
            }
            return new Promise<void>(resolve => {
                let sizeZero = this.size;
                let t = 0;
                this._animateSizeCB = () => {
                    t += this.scene.getEngine().getDeltaTime() / 1000;
                    if (t < duration) {
                        let f = t / duration;
                        this.size = sizeZero * (1 - f) + sizeTarget * f;
                        if (this.slika) {
                            this.slika.needRedraw = true;
                        }
                    }
                    else {
                        this.size = sizeTarget;
                        if (this.slika) {
                            this.slika.needRedraw = true;
                        }
                        this.scene.onBeforeRenderObservable.removeCallback(this._animateSizeCB);
                        this._animateSizeCB = undefined;
                        resolve();
                    }
                }
                this.scene.onBeforeRenderObservable.add(this._animateSizeCB);
            });
        }
    }
}