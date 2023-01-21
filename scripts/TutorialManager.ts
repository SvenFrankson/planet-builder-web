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
        this.main.subtitleManager.display(Subtitle.Create(["Lesson 1 / 87 - Head control. Hold clic ", "<img src='datas/icons/mouse-left.svg'/>", " and rotate to look around."], 3));
        this.scene.onBeforeRenderObservable.add(this.waitForLookAround);
    }

    private waitForLookAroundTimer: number = 0;
    private waitForLookAround = () => {
        if (this.player.inputHeadUp != 0 || this.player.inputHeadRight != 0) {
            let dt = this.engine.getDeltaTime() / 1000;
            this.waitForLookAroundTimer += dt;
            // If current tutorial step (look around) is completed.
            if (this.waitForLookAroundTimer > 2) {
                this.scene.onBeforeRenderObservable.removeCallback(this.waitForLookAround);
                // Start next tutorial step (move).
                this.main.subtitleManager.display(Subtitle.Create(["Well done ! You can now look around."], 3)).then(() => {
                    this.main.subtitleManager.display(Subtitle.Create(["Lesson 1.a / 87 - Movement. Press ", "<span class='keyboard'>W</span>", ", ", "<span class='keyboard'>A</span>", ", ", "<span class='keyboard'>S</span>", " and ", "<span class='keyboard'>D</span>", " to move."], 3));
                    this.scene.onBeforeRenderObservable.add(this.waitForMove);
                });
            }
        }
    }
    
    private waitForMoveTimer: number = 0;
    private waitForMove = () => {
        if (this.player.inputForward != 0 || this.player.inputRight != 0) {
            let dt = this.engine.getDeltaTime() / 1000;
            this.waitForMoveTimer += dt;
            // If current tutorial step (move) is completed.
            if (this.waitForMoveTimer > 2) {
                this.scene.onBeforeRenderObservable.removeCallback(this.waitForMove);
                // Start next tutorial step (move to location).
                this.main.subtitleManager.display(Subtitle.Create(["Ok, you know how to move."], 3)).then(() => {
                    this.main.subtitleManager.display(Subtitle.Create(["Lesson 1.b / 87 - Move To Location. Hold clic ", "<img src='datas/icons/mouse-left.svg'/>", " in place to move to target location."], 3));
                    this.scene.onBeforeRenderObservable.add(this.waitForMoveToLocation);
                });
            }
        }
    }
    
    private waitForMoveToLocationTimer: number = 0;
    private waitForMoveToLocation = () => {
        if (this.player.isPosAnimating) {
            let dt = this.engine.getDeltaTime() / 1000;
            this.waitForMoveToLocationTimer += dt;
            // If current tutorial step (move to location) is completed.
            if (this.waitForMoveToLocationTimer > 0.5) {
                this.scene.onBeforeRenderObservable.removeCallback(this.waitForMoveToLocation);
                // Start next tutorial step (jump).
                this.main.subtitleManager.display(Subtitle.Create(["Nice, that's how you move to target location."], 3)).then(() => {
                    this.main.subtitleManager.display(Subtitle.Create(["Lesson 1.c / 87 - Jump. Press ", "<span class='keyboard'>SPACE</span>", " to jump."], 3));
                    this.main.inputManager.addMappedKeyUpListener(KeyInput.JUMP, this.onJump);
                });
            }
        }
    }
    
    private onJump = () => {
        this.main.inputManager.removeMappedKeyUpListener(KeyInput.JUMP, this.onJump);
        // Start next tutorial step (open main menu).
        this.main.subtitleManager.display(Subtitle.Create(["That's a new height record !"], 3)).then(() => {
            this.main.subtitleManager.display(Subtitle.Create(["Lesson 1.d / 87 - Open Menu. Press ", "<span class='keyboard'>²</span>", " to open Planet Selection Menu."], 3));
            this.main.inputManager.addMappedKeyUpListener(KeyInput.MAIN_MENU, this.onMainMenu);
        });
    }

    private onMainMenu = () => {
        this.main.inputManager.removeMappedKeyUpListener(KeyInput.MAIN_MENU, this.onMainMenu);
        this.main.subtitleManager.display(Subtitle.Create(["Good, now pick a planet and explore !"], 3));
    }
}