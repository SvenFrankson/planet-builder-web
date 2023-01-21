enum TutorialStep {
    Off,
    LookAround,
    MoveAround,
    MoveToLocation,
    Jump,
    OpenMenu,
    Completed
}

class TutorialManager {

    public step: TutorialStep = TutorialStep.Off;

    public get engine(): BABYLON.Engine {
        return this.main.engine;
    }
    
    public get scene(): BABYLON.Scene {
        return this.main.scene;
    }

    public get player(): Player {
        return this.main.player;
    }

    constructor(public main: MainMenu) {

    }

    public async runTutorial(): Promise<void> {
        await this.main.subtitleManager.display(Subtitle.Create(["Hello there ! Let me introduce myself : I'm an extremely advanced AI, and I will take you through a quick control course."], 3));
        this.step = TutorialStep.LookAround;
        this.main.subtitleManager.display(Subtitle.Create(["Lesson 1/87 - Head control. Hold clic ", "<img src='datas/icons/mouse-left.svg'/>", " and rotate to look around."], 3));
        this.scene.onBeforeRenderObservable.add(this.waitForLookAround);
    }

    private waitForLookAroundTimer: number = 0;
    private waitForLookAround = () => {
        if (this.player.inputHeadUp != 0 || this.player.inputHeadRight != 0) {
            let dt = this.engine.getDeltaTime() / 1000;
            this.waitForLookAroundTimer += dt;
            if (this.waitForLookAroundTimer > 2) {
                this.scene.onBeforeRenderObservable.removeCallback(this.waitForLookAround);
                this.main.subtitleManager.display(Subtitle.Create(["Well done ! You can now look around."], 3));
            }
        }
    }
}