class Subtitle {

    constructor(
        public text: string,
        public duration: number,
        public durationMin: number = 1,
        public speed: number = 60
    ) {

    }
}

enum SubtitleManagerStatus {
    Ready,
    Writing,
    Displaying,
    Erasing
}

class SubtitleManager {

    public subtitlesBuffer: Subtitle[] = [];
    private _currentSubtitle: Subtitle;

    private _timer: number = 0;
    private _status: SubtitleManagerStatus = SubtitleManagerStatus.Ready;

    public get engine(): BABYLON.Engine {
        return this.main.engine;
    }

    public get scene(): BABYLON.Scene {
        return this.main.scene;
    }

    constructor(public main: Main, public container?: HTMLDivElement) {
        if (!this.container) {
            this.container = document.createElement("div");
            this.container.id = "subtitles-container";
            document.body.appendChild(this.container);
        }
    }

    public initialize(): void {
        this.scene.onBeforeRenderObservable.add(this._update);
    }

    public add(subtitle: Subtitle): void {
        this.subtitlesBuffer.push(subtitle);
    }

    private _update = () => {
        if (this._status === SubtitleManagerStatus.Ready && this.subtitlesBuffer.length > 0) {
            this._currentSubtitle = this.subtitlesBuffer.splice(0, 1)[0];
            this._status = SubtitleManagerStatus.Writing;
            this._timer = 0;
            this.container.style.color = "rgba(255, 255, 255, 100%)";
            this.container.style.display = "";
        }

        // If there's no new subtitle to display, hide the container.
        if (this._status === SubtitleManagerStatus.Ready) {
            this.container.innerText = "";
            this.container.style.display = "none";
        }

        if (this._status === SubtitleManagerStatus.Writing) {
            this._timer += this.engine.getDeltaTime() / 1000;
            let l = Math.floor(this._timer * this._currentSubtitle.speed);
            if (l > this._currentSubtitle.text.length) {
                l = this._currentSubtitle.text.length;
                this._status = SubtitleManagerStatus.Displaying;
                this._timer = 0;
            }
            let content = this._currentSubtitle.text.substring(0, l);
            this.container.innerText = content;
        }

        if (this._status === SubtitleManagerStatus.Displaying) {
            this._timer += this.engine.getDeltaTime() / 1000;
            if (this._timer > this._currentSubtitle.duration) {
                this._status = SubtitleManagerStatus.Erasing;
                this._timer = 0;
            }
        }

        if (this._status === SubtitleManagerStatus.Erasing) {
            this._timer += this.engine.getDeltaTime() / 1000;
            let a = (1 - (this._timer / 0.25)) * 100;
            a = Math.max(a, 0);
            this.container.style.color = "rgba(255, 255, 255, " + a.toFixed(1) + "%)";

            if (this._timer > 0.5) {
                this._status = SubtitleManagerStatus.Ready;
                this._timer = 0;
            }
        }
    }
}