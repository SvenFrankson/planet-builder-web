class TextPage {

    public mesh: BABYLON.Mesh;
    public material: BABYLON.StandardMaterial;
    public texture: BABYLON.DynamicTexture;

    public lines: string[] = [];

    private _w: number = 1600;
    private _h: number = 1000;

    constructor(public game: Game) {

    }

    public instantiate(): void {
        this.mesh = BABYLON.MeshBuilder.CreatePlane("text-page", { width: this._w / 500, height: this._h / 500, sideOrientation: 2 }, this.game.scene);
        this.mesh.layerMask = 0x10000000;

        this.material = new BABYLON.StandardMaterial("text-page-material", this.game.scene);
        this.material.useAlphaFromDiffuseTexture = true;
        this.material.specularColor.copyFromFloats(0, 0, 0);
        this.material.emissiveColor.copyFromFloats(1, 1, 1);
        this.mesh.material = this.material;

        this.texture = new BABYLON.DynamicTexture("text-page-texture", { width: this._w, height: this._h }, this.game.scene, true);
        this.texture.hasAlpha = true;
        this.material.diffuseTexture = this.texture;

        this.lines[0] = "You know what? It is beets. I've crashed into a beet truck. Jaguar shark! So tell me - does it really exist? Is this my espresso machine? Wh-what is-h-how did you get my espresso machine? Hey, take a look at the earthlings. Goodbye! I was part of something special.";
        this.lines[1] = "Yeah, but John, if The Pirates of the Caribbean breaks down, the pirates don’t eat the tourists. Jaguar shark! So tell me - does it really exist? Did he just throw my cat out of the window? You're a very talented young man, with your own clever thoughts and ideas. Do you need a manager?";
        this.lines[2] = "Forget the fat lady! You're obsessed with the fat lady! Drive us out of here! God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs. You know what? It is beets. I've crashed into a beet truck. Hey, you know how I'm, like, always trying to save the planet? Here's my chance.";
        this.lines[3] = "Eventually, you do plan to have dinosaurs on your dinosaur tour, right? Just my luck, no ice. Remind me to thank John for a lovely weekend. This thing comes fully loaded. AM/FM radio, reclining bucket seats, and... power windows. Must go faster... go, go, go, go, go!";
        this.lines[4] = "Checkmate... Must go faster... go, go, go, go, go! Hey, you know how I'm, like, always trying to save the planet? Here's my chance. God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs. Checkmate... You're a very talented young man, with your own clever thoughts and ideas. Do you need a manager?";
    }

    public setPosition(position: BABYLON.Vector3): void {
        if (this.mesh) {
            this.mesh.position = position;
        }
    }

    public redraw(): void {
        let marginLeft = 200;
        let maxChar = 75;
        let marginTop = 100;
        let fontSize = 30;

        let context = this.texture.getContext();
        context.clearRect(0, 0, this._w, this._h);
        context.fillStyle = "rgba(20, 20, 40, 0.8)";
        context.fillRect(0, 15, this._w, this._h - 2 * 15);
        context.fillStyle = "rgba(255, 255, 255, 1)";
        context.font = fontSize.toFixed(0) + "px Consolas";
        let line = this.lines[0];
        let i = 0;
        let ii = 0;
        while (line && ii < 1000 / fontSize) {
            context.fillText((i + 1).toFixed(0) + ":", marginLeft - 2 * fontSize, marginTop + fontSize * (ii + 1));
            let cutLine = line.substring(0, 75);
            context.fillText(cutLine, marginLeft, marginTop + fontSize * (ii + 1));
            ii++;
            line = line.substring(75);
            while (line.length > 0) {
                cutLine = line.substring(0, 75);
                context.fillText(cutLine, marginLeft, marginTop + fontSize * (ii + 1));
                ii++;
                line = line.substring(75);
            }
            i++;
            line = this.lines[i];
        }
        context.lineWidth = 20;
        context.strokeStyle = "rgba(0, 255, 255, 1)";
        context.beginPath();
        context.moveTo(0, 15);
        context.lineTo(this._w, 15);
        context.moveTo(0, this._h - 15);
        context.lineTo(this._w, this._h - 15);
        context.lineWidth = 25;
        context.strokeStyle = "rgba(255, 255, 255, 0.5)";
        context.stroke();
        context.lineWidth = 20;
        context.strokeStyle = "rgba(127, 255, 255, 0.5)";
        context.stroke();
        context.lineWidth = 15;
        context.strokeStyle = "rgba(0, 255, 255, 0.5)";
        context.stroke();
        this.texture.update();
    }
}